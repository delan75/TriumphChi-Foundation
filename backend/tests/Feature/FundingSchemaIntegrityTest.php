<?php

namespace Tests\Feature;

use App\Enums\BeneficiaryStatus;
use App\Enums\DonationStatus;
use App\Enums\NeedStatus;
use App\Models\Allocation;
use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\Donor;
use App\Models\EducationalNeed;
use App\Models\Fund;
use App\Models\Payment;
use App\Models\School;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FundingSchemaIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_financial_chain_preserves_donation_allocation_payment_traceability(): void
    {
        [$donor, $fund, $donation, $need, $allocation, $payment] = $this->createFundingChain();

        $payment->allocations()->attach($allocation->id, ['amount_applied' => 60000]);

        $this->assertTrue($donor->donations()->whereKey($donation->id)->exists());
        $this->assertTrue($fund->donations()->whereKey($donation->id)->exists());
        $this->assertTrue($donation->allocations()->whereKey($allocation->id)->exists());
        $this->assertTrue($need->allocations()->whereKey($allocation->id)->exists());
        $this->assertTrue($payment->allocations()->whereKey($allocation->id)->exists());

        $this->assertDatabaseHas('allocation_payment', [
            'allocation_id' => $allocation->id,
            'payment_id' => $payment->id,
            'amount_applied' => 60000,
        ]);
    }

    public function test_duplicate_financial_references_are_rejected(): void
    {
        [$donor, $fund] = $this->createDonorAndFund();

        Donation::create([
            'reference_number' => 'DON-DUP',
            'idempotency_key' => 'idem-donation-1',
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => 50000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'provider' => 'manual',
            'provider_reference' => 'BANK-001',
            'status' => DonationStatus::Confirmed,
            'donated_at' => now(),
        ]);

        $this->expectException(QueryException::class);

        Donation::create([
            'reference_number' => 'DON-DUP',
            'idempotency_key' => 'idem-donation-2',
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => 25000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'provider' => 'manual',
            'provider_reference' => 'BANK-002',
            'status' => DonationStatus::Confirmed,
            'donated_at' => now(),
        ]);
    }

    public function test_allocation_payment_bridge_supports_partial_payments_and_rejects_duplicates(): void
    {
        [, , , , $allocation, $payment] = $this->createFundingChain([
            'allocation_amount' => 100000,
            'payment_amount' => 40000,
        ]);

        $payment->allocations()->attach($allocation->id, ['amount_applied' => 40000]);

        $this->assertDatabaseHas('allocation_payment', [
            'allocation_id' => $allocation->id,
            'payment_id' => $payment->id,
            'amount_applied' => 40000,
        ]);

        $this->expectException(QueryException::class);

        $payment->allocations()->attach($allocation->id, ['amount_applied' => 10000]);
    }

    public function test_financial_records_are_soft_deleted_and_hard_delete_restricted_when_referenced(): void
    {
        [$donor, $fund, $donation, , $allocation, $payment] = $this->createFundingChain();

        Sponsorship::create([
            'sponsorship_reference' => 'SPN-001',
            'donor_id' => $donor->id,
            'beneficiary_id' => $allocation->educationalNeed->beneficiary_id,
            'fund_id' => $fund->id,
            'type' => 'partial',
            'pledged_amount' => 60000,
            'currency' => 'XAF',
            'billing_frequency' => 'one_time',
            'starts_at' => now()->toDateString(),
            'status' => 'active',
        ]);

        $donation->delete();
        $allocation->delete();
        $payment->delete();
        $fund->delete();
        $donor->delete();

        $this->assertSoftDeleted('donations', ['id' => $donation->id]);
        $this->assertSoftDeleted('allocations', ['id' => $allocation->id]);
        $this->assertSoftDeleted('payments', ['id' => $payment->id]);
        $this->assertSoftDeleted('funds', ['id' => $fund->id]);
        $this->assertSoftDeleted('donors', ['id' => $donor->id]);

        $this->expectException(QueryException::class);

        $fund->forceDelete();
    }

    private function createDonorAndFund(): array
    {
        $user = User::create([
            'name' => 'Finance Officer',
            'email' => 'finance@example.org',
            'password' => 'password',
        ]);

        $donor = Donor::create([
            'name' => 'ABC Telecom',
            'email' => 'csr@example.org',
            'type' => 'organization',
            'status' => 'active',
            'communication_preferences' => ['email' => true],
        ]);

        $fund = Fund::create([
            'code' => 'FND-EDU',
            'name' => 'Education Sponsorship Fund',
            'slug' => 'education-sponsorship',
            'currency' => 'XAF',
            'restriction_type' => 'education',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        return [$donor, $fund, $user];
    }

    private function createFundingChain(array $overrides = []): array
    {
        [$donor, $fund, $user] = $this->createDonorAndFund();

        $school = School::create([
            'code' => 'SCH-FIN',
            'name' => 'Financial Trace School',
            'verification_status' => 'verified',
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-FIN',
            'school_id' => $school->id,
            'status' => BeneficiaryStatus::ActiveSupport,
            'first_name' => 'Claudine',
            'last_name' => 'Ngono',
        ]);

        $need = EducationalNeed::create([
            'beneficiary_id' => $beneficiary->id,
            'type' => 'school_fees',
            'title' => 'Annual school fees',
            'amount_required' => 100000,
            'amount_funded' => 0,
            'status' => NeedStatus::Open,
            'academic_year' => '2026-2027',
        ]);

        $donation = Donation::create([
            'reference_number' => $overrides['donation_reference'] ?? 'DON-TRACE',
            'idempotency_key' => $overrides['donation_idempotency_key'] ?? 'idem-trace',
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => $overrides['donation_amount'] ?? 100000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'provider' => 'manual',
            'provider_reference' => $overrides['provider_reference'] ?? 'BANK-TRACE',
            'status' => DonationStatus::Confirmed,
            'donated_at' => now(),
            'confirmed_at' => now(),
        ]);

        $allocation = Allocation::create([
            'allocation_reference' => $overrides['allocation_reference'] ?? 'ALL-TRACE',
            'donation_id' => $donation->id,
            'fund_id' => $fund->id,
            'educational_need_id' => $need->id,
            'amount' => $overrides['allocation_amount'] ?? 60000,
            'currency' => 'XAF',
            'status' => 'approved',
            'allocated_at' => now(),
            'created_by' => $user->id,
            'approved_by' => $user->id,
        ]);

        $payment = Payment::create([
            'payment_reference' => $overrides['payment_reference'] ?? 'PAY-TRACE',
            'idempotency_key' => $overrides['payment_idempotency_key'] ?? 'idem-payment-trace',
            'fund_id' => $fund->id,
            'school_id' => $school->id,
            'beneficiary_id' => $beneficiary->id,
            'educational_need_id' => $need->id,
            'payee_type' => 'school',
            'payee_name' => $school->name,
            'amount' => $overrides['payment_amount'] ?? 60000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'payment_date' => now()->toDateString(),
            'approved_by' => $user->id,
            'disbursed_by' => $user->id,
            'status' => 'approved',
        ]);

        return [$donor, $fund, $donation, $need, $allocation, $payment];
    }
}
