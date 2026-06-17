<?php

namespace App\Services;

use App\Enums\DonationStatus;
use App\Models\Allocation;
use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\EducationalNeed;
use App\Models\Fund;
use App\Models\Payment;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FundingTransactionService
{
    public function createDonation(array $data): Donation
    {
        return DB::transaction(function () use ($data): Donation {
            $existing = $this->findExistingDonation($data);

            if ($existing instanceof Donation) {
                return $existing;
            }

            $this->assertDonationReferenceIsAvailable($data['reference_number']);

            Fund::query()
                ->whereKey($data['fund_id'])
                ->lockForUpdate()
                ->firstOrFail();

            return Donation::create($data);
        });
    }

    public function createAllocation(array $data, User $user): Allocation
    {
        return DB::transaction(function () use ($data, $user): Allocation {
            Fund::query()
                ->whereKey($data['fund_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $need = EducationalNeed::query()
                ->whereKey($data['educational_need_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $donation = null;

            if (! empty($data['donation_id'])) {
                $donation = Donation::query()
                    ->whereKey($data['donation_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $this->assertDonationCanFundAllocation($donation, $data);
                $this->assertDonationHasRemainingAmount($donation, $data['amount']);
            }

            $this->assertNeedHasRemainingAmount($need, $data['amount']);

            $payload = [
                ...$data,
                'created_by' => $user->id,
                'approved_by' => ($data['status'] ?? null) === 'approved' ? $user->id : null,
            ];

            return Allocation::create($payload);
        });
    }

    public function createPayment(array $data, User $user): Payment
    {
        return DB::transaction(function () use ($data, $user): Payment {
            $existing = $this->findExistingPayment($data);

            if ($existing instanceof Payment) {
                return $existing->load('allocations');
            }

            $this->assertPaymentReferenceIsAvailable($data['payment_reference']);

            $allocationLinks = $data['allocations'] ?? [];
            unset($data['allocations']);

            $lockedAllocations = $this->lockAllocationsForPayment($allocationLinks);
            $this->assertPaymentAllocationAmounts($data, $allocationLinks, $lockedAllocations);

            if (! empty($lockedAllocations) && empty($data['fund_id'])) {
                $data['fund_id'] = collect($lockedAllocations)->first()->fund_id;
            }

            if (! empty($data['fund_id'])) {
                Fund::query()
                    ->whereKey($data['fund_id'])
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            if (! empty($data['school_id'])) {
                School::query()->whereKey($data['school_id'])->lockForUpdate()->firstOrFail();
            }

            if (! empty($data['beneficiary_id'])) {
                Beneficiary::query()->whereKey($data['beneficiary_id'])->lockForUpdate()->firstOrFail();
            }

            if (! empty($data['educational_need_id'])) {
                EducationalNeed::query()->whereKey($data['educational_need_id'])->lockForUpdate()->firstOrFail();
            }

            $status = $data['status'] ?? null;

            if (in_array($status, ['approved', 'paid', 'confirmed'], true)) {
                $data['approved_by'] = $user->id;
            }

            if (in_array($status, ['paid', 'confirmed'], true)) {
                $data['disbursed_by'] = $user->id;
            }

            $payment = Payment::create($data);

            foreach ($allocationLinks as $link) {
                $payment->allocations()->attach($link['allocation_id'], [
                    'amount_applied' => $link['amount_applied'],
                ]);
            }

            return $payment->load('allocations');
        });
    }

    private function findExistingDonation(array $data): ?Donation
    {
        if (! empty($data['idempotency_key'])) {
            $donation = Donation::query()
                ->where('idempotency_key', $data['idempotency_key'])
                ->first();

            if ($donation instanceof Donation) {
                return $donation;
            }
        }

        if (! empty($data['provider']) && ! empty($data['provider_reference'])) {
            return Donation::query()
                ->where('provider', $data['provider'])
                ->where('provider_reference', $data['provider_reference'])
                ->first();
        }

        return null;
    }

    private function findExistingPayment(array $data): ?Payment
    {
        if (empty($data['idempotency_key'])) {
            return null;
        }

        return Payment::query()
            ->where('idempotency_key', $data['idempotency_key'])
            ->first();
    }

    private function assertDonationReferenceIsAvailable(string $referenceNumber): void
    {
        if (Donation::query()->where('reference_number', $referenceNumber)->exists()) {
            throw ValidationException::withMessages([
                'reference_number' => __('api.errors.donation_reference_exists'),
            ]);
        }
    }

    private function assertPaymentReferenceIsAvailable(string $paymentReference): void
    {
        if (Payment::query()->where('payment_reference', $paymentReference)->exists()) {
            throw ValidationException::withMessages([
                'payment_reference' => __('api.errors.payment_reference_exists'),
            ]);
        }
    }

    private function assertDonationCanFundAllocation(Donation $donation, array $data): void
    {
        $status = $donation->status instanceof DonationStatus
            ? $donation->status->value
            : (string) $donation->status;

        if ($status !== DonationStatus::Confirmed->value) {
            throw ValidationException::withMessages([
                'donation_id' => __('api.errors.donation_must_be_confirmed'),
            ]);
        }

        if ((int) $donation->fund_id !== (int) $data['fund_id']) {
            throw ValidationException::withMessages([
                'fund_id' => __('api.errors.allocation_fund_mismatch'),
            ]);
        }

        if ($donation->currency !== $data['currency']) {
            throw ValidationException::withMessages([
                'currency' => __('api.errors.allocation_currency_mismatch'),
            ]);
        }
    }

    private function assertDonationHasRemainingAmount(Donation $donation, mixed $amount): void
    {
        $allocated = Allocation::query()
            ->where('donation_id', $donation->id)
            ->whereIn('status', ['proposed', 'approved'])
            ->lockForUpdate()
            ->get(['amount'])
            ->sum(fn (Allocation $allocation): int => $this->moneyToMinor($allocation->amount));

        if ($allocated + $this->moneyToMinor($amount) > $this->moneyToMinor($donation->amount)) {
            throw ValidationException::withMessages([
                'amount' => __('api.errors.donation_over_allocated'),
            ]);
        }
    }

    private function assertNeedHasRemainingAmount(EducationalNeed $need, mixed $amount): void
    {
        $allocated = Allocation::query()
            ->where('educational_need_id', $need->id)
            ->whereIn('status', ['proposed', 'approved'])
            ->lockForUpdate()
            ->get(['amount'])
            ->sum(fn (Allocation $allocation): int => $this->moneyToMinor($allocation->amount));

        if ($allocated + $this->moneyToMinor($amount) > $this->moneyToMinor($need->amount_required)) {
            throw ValidationException::withMessages([
                'amount' => __('api.errors.need_over_allocated'),
            ]);
        }
    }

    private function lockAllocationsForPayment(array $allocationLinks): array
    {
        if ($allocationLinks === []) {
            return [];
        }

        $allocationIds = collect($allocationLinks)->pluck('allocation_id')->all();

        return Allocation::query()
            ->whereIn('id', $allocationIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id')
            ->all();
    }

    private function assertPaymentAllocationAmounts(array $data, array $allocationLinks, array $lockedAllocations): void
    {
        if ($allocationLinks === []) {
            return;
        }

        $linkedAmount = collect($allocationLinks)
            ->sum(fn (array $link): int => $this->moneyToMinor($link['amount_applied']));

        if ($linkedAmount !== $this->moneyToMinor($data['amount'])) {
            throw ValidationException::withMessages([
                'allocations' => __('api.errors.payment_allocation_total_mismatch'),
            ]);
        }

        foreach ($allocationLinks as $link) {
            $allocation = $lockedAllocations[$link['allocation_id']] ?? null;

            if (! $allocation instanceof Allocation) {
                throw ValidationException::withMessages([
                    'allocations' => __('api.errors.payment_allocation_missing'),
                ]);
            }

            if ($allocation->status !== 'approved') {
                throw ValidationException::withMessages([
                    'allocations' => __('api.errors.payment_allocation_not_approved'),
                ]);
            }

            if (! empty($data['fund_id']) && (int) $allocation->fund_id !== (int) $data['fund_id']) {
                throw ValidationException::withMessages([
                    'fund_id' => __('api.errors.payment_fund_mismatch'),
                ]);
            }

            $applied = DB::table('allocation_payment')
                ->where('allocation_id', $allocation->id)
                ->lockForUpdate()
                ->get(['amount_applied'])
                ->sum(fn (object $row): int => $this->moneyToMinor($row->amount_applied));

            if ($applied + $this->moneyToMinor($link['amount_applied']) > $this->moneyToMinor($allocation->amount)) {
                throw ValidationException::withMessages([
                    'allocations' => __('api.errors.allocation_over_paid'),
                ]);
            }
        }
    }

    private function moneyToMinor(mixed $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }
}
