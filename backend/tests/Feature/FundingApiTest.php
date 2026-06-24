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
use App\Models\PaymentIntent;
use App\Models\PaymentProvider;
use App\Models\PaymentTransaction;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class FundingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_donation_index_requires_authentication_and_view_permission(): void
    {
        $this->getJson('/api/v1/donations')
            ->assertUnauthorized();

        Sanctum::actingAs(User::create([
            'name' => 'No Permission',
            'email' => 'no-permission@example.org',
            'password' => 'password',
        ]));

        $this->getJson('/api/v1/donations')
            ->assertForbidden();

        $this->actingWithPermissions('donations.view');

        $this->getJson('/api/v1/donations')
            ->assertOk();
    }

    public function test_donation_provider_retry_is_idempotent(): void
    {
        $user = $this->actingWithPermissions('donations.create');
        [$donor, $fund] = $this->createDonorAndFund($user);

        $payload = [
            'reference_number' => 'DON-API-001',
            'idempotency_key' => 'idem-donation-api-001',
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => 100000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'provider' => 'manual',
            'provider_reference' => 'BANK-API-001',
            'status' => DonationStatus::Confirmed->value,
            'donated_at' => now()->toISOString(),
            'confirmed_at' => now()->toISOString(),
        ];

        $first = $this->postJson('/api/v1/donations', $payload)
            ->assertCreated()
            ->assertJsonPath('data.reference_number', 'DON-API-001');

        $second = $this->postJson('/api/v1/donations', $payload)
            ->assertOk();

        $this->assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertDatabaseCount('donations', 1);
    }

    public function test_donation_management_index_filters_and_returns_operational_summary(): void
    {
        $user = $this->actingWithPermissions('donations.view');
        [$donor, $fund] = $this->createDonorAndFund($user);
        [$otherDonor, $otherFund] = $this->createDonorAndFund($user);

        $donation = $this->createDonation($donor, $fund, 25000, [
            'currency' => 'XAF',
            'provider' => 'paypal',
            'method' => 'paypal',
            'status' => DonationStatus::Confirmed,
            'donated_at' => now()->subDays(2),
            'confirmed_at' => now()->subDays(2),
        ]);

        $this->createDonation($otherDonor, $otherFund, 10, [
            'currency' => 'USD',
            'provider' => 'paypal',
            'method' => 'paypal',
            'status' => DonationStatus::Pending,
            'donated_at' => now()->subDay(),
            'confirmed_at' => null,
        ]);

        $this->createDonation($otherDonor, $fund, 5000, [
            'currency' => 'XAF',
            'provider' => 'momo',
            'method' => 'mtn_mobile_money',
            'status' => DonationStatus::Failed,
            'donated_at' => now(),
            'confirmed_at' => null,
        ]);

        $response = $this->getJson('/api/v1/donations?provider=paypal&currency=XAF&search=ABC&sort=amount&direction=asc');

        $response->assertOk()
            ->assertJsonPath('data.0.uuid', $donation->uuid)
            ->assertJsonPath('data.0.reference_number', $donation->reference_number)
            ->assertJsonPath('data.0.donor.name', $donor->name)
            ->assertJsonPath('data.0.fund.name', $fund->name)
            ->assertJsonPath('data.0.permissions.can_view', true)
            ->assertJsonPath('data.0.permissions.can_approve', false)
            ->assertJsonPath('summary.total_count', 1)
            ->assertJsonPath('summary.status_counts.confirmed', 1)
            ->assertJsonPath('summary.currency_totals.XAF.amount', '25000.00')
            ->assertJsonPath('summary.provider_counts.paypal', 1);
    }

    public function test_donation_management_show_returns_traceability_without_raw_provider_payload_or_child_leakage(): void
    {
        $user = $this->actingWithPermissions('donations.view');
        [$donor, $fund] = $this->createDonorAndFund($user);
        [, $need] = $this->createBeneficiaryNeed();
        $donation = $this->createDonation($donor, $fund, 60000);

        $allocation = Allocation::create([
            'allocation_reference' => 'ALL-DON-MGMT-001',
            'donation_id' => $donation->id,
            'fund_id' => $fund->id,
            'educational_need_id' => $need->id,
            'amount' => 30000,
            'currency' => 'XAF',
            'status' => 'approved',
            'allocated_at' => now(),
            'created_by' => $user->id,
            'approved_by' => $user->id,
        ]);

        $provider = PaymentProvider::create([
            'key' => 'paypal',
            'name' => 'PayPal',
            'method' => 'paypal',
            'category' => 'wallet',
            'status' => 'active',
            'currencies' => ['USD'],
            'sort_order' => 10,
        ]);

        $intent = PaymentIntent::create([
            'intent_reference' => 'PINT-DON-MGMT-001',
            'donation_id' => $donation->id,
            'payment_provider_id' => $provider->id,
            'amount' => 60000,
            'currency' => 'XAF',
            'frequency' => 'one_time',
            'purpose' => 'school_fees',
            'status' => 'completed',
            'provider_intent_id' => 'PAYPAL-ORDER-001',
            'expires_at' => now()->addMinutes(30),
        ]);

        PaymentTransaction::create([
            'payment_intent_id' => $intent->id,
            'donation_id' => $donation->id,
            'payment_provider_id' => $provider->id,
            'transaction_reference' => 'PTXN-DON-MGMT-001',
            'provider_transaction_id' => 'PAYPAL-CAPTURE-001',
            'type' => 'paypal_capture',
            'status' => 'completed',
            'amount' => 60000,
            'currency' => 'XAF',
            'processed_at' => now(),
            'raw_payload' => ['sensitive_provider_body' => 'hidden-from-api'],
        ]);

        $response = $this->getJson("/api/v1/donations/{$donation->uuid}");

        $response->assertOk()
            ->assertJsonPath('data.uuid', $donation->uuid)
            ->assertJsonPath('data.allocation_summary.count', 1)
            ->assertJsonPath('data.allocation_summary.allocated_amount', '30000.00')
            ->assertJsonPath('data.allocation_summary.unallocated_amount', '30000.00')
            ->assertJsonPath('data.allocations.0.uuid', $allocation->uuid)
            ->assertJsonPath('data.allocations.0.educational_need.uuid', $need->uuid)
            ->assertJsonPath('data.allocations.0.educational_need.beneficiary', null)
            ->assertJsonPath('data.payment_summary.latest_intent.intent_reference', 'PINT-DON-MGMT-001')
            ->assertJsonPath('data.payment_summary.latest_transaction.transaction_reference', 'PTXN-DON-MGMT-001')
            ->assertJsonMissingPath('data.transactions.0.raw_payload');

        $this->givePermissions($user, 'beneficiaries.view');

        $this->getJson("/api/v1/donations/{$donation->uuid}")
            ->assertOk()
            ->assertJsonPath('data.allocations.0.educational_need.beneficiary.internal_id', $need->beneficiary->internal_id);
    }

    public function test_allocation_store_requires_permission_and_prevents_over_allocation(): void
    {
        $user = User::create([
            'name' => 'Finance User',
            'email' => 'finance-user@example.org',
            'password' => 'password',
        ]);

        [$donor, $fund] = $this->createDonorAndFund($user);
        [$beneficiary, $need] = $this->createBeneficiaryNeed();

        $donation = $this->createDonation($donor, $fund, 100000);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/allocations', [
            'allocation_reference' => 'ALL-NO-PERM',
            'donation_id' => $donation->id,
            'fund_id' => $fund->id,
            'educational_need_id' => $need->id,
            'amount' => 10000,
            'currency' => 'XAF',
            'status' => 'approved',
        ])->assertForbidden();

        $this->givePermissions($user, 'allocations.create');

        $this->postJson('/api/v1/allocations', [
            'allocation_reference' => 'ALL-API-001',
            'donation_id' => $donation->id,
            'fund_id' => $fund->id,
            'educational_need_id' => $need->id,
            'amount' => 70000,
            'currency' => 'XAF',
            'status' => 'approved',
            'allocated_at' => now()->toISOString(),
        ])->assertCreated()
            ->assertJsonPath('data.created_by', $user->id)
            ->assertJsonPath('data.approved_by', $user->id);

        $frenchResponse = $this->withHeader('Accept-Language', 'fr')
            ->postJson('/api/v1/allocations', [
                'allocation_reference' => 'ALL-API-002',
                'donation_id' => $donation->id,
                'fund_id' => $fund->id,
                'educational_need_id' => $need->id,
                'amount' => 40000,
                'currency' => 'XAF',
                'status' => 'approved',
                'allocated_at' => now()->toISOString(),
            ]);

        $frenchResponse->assertUnprocessable()
            ->assertJsonValidationErrors('amount')
            ->assertJsonPath('errors.amount.0', fn ($message) => str_contains($message, 'L allocation') || str_contains($message, 'dépasserait'));

        $this->assertDatabaseHas('allocations', [
            'allocation_reference' => 'ALL-API-001',
            'created_by' => $user->id,
            'approved_by' => $user->id,
        ]);

        $this->assertDatabaseMissing('allocations', [
            'allocation_reference' => 'ALL-API-002',
        ]);

        $this->assertTrue($beneficiary->needs()->whereKey($need->id)->exists());
    }

    public function test_payment_store_preserves_allocation_traceability_and_rejects_duplicate_reference(): void
    {
        $user = $this->actingWithPermissions('payments.create');
        [$donor, $fund] = $this->createDonorAndFund($user);
        [, $need] = $this->createBeneficiaryNeed();
        $donation = $this->createDonation($donor, $fund, 60000);

        $allocation = Allocation::create([
            'allocation_reference' => 'ALL-PAY-001',
            'donation_id' => $donation->id,
            'fund_id' => $fund->id,
            'educational_need_id' => $need->id,
            'amount' => 60000,
            'currency' => 'XAF',
            'status' => 'approved',
            'allocated_at' => now(),
            'created_by' => $user->id,
            'approved_by' => $user->id,
        ]);

        $payload = [
            'payment_reference' => 'PAY-API-001',
            'idempotency_key' => 'idem-payment-api-001',
            'fund_id' => $fund->id,
            'school_id' => $need->beneficiary->school_id,
            'beneficiary_id' => $need->beneficiary_id,
            'educational_need_id' => $need->id,
            'payee_type' => 'school',
            'payee_name' => 'API Trace School',
            'amount' => 60000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'payment_date' => now()->toDateString(),
            'status' => 'paid',
            'allocations' => [
                [
                    'allocation_id' => $allocation->id,
                    'amount_applied' => 60000,
                ],
            ],
        ];

        $this->postJson('/api/v1/payments', $payload)
            ->assertCreated()
            ->assertJsonPath('data.payment_reference', 'PAY-API-001')
            ->assertJsonPath('data.status_label', 'Paid');

        $this->assertDatabaseHas('allocation_payment', [
            'allocation_id' => $allocation->id,
            'amount_applied' => 60000,
        ]);

        $this->postJson('/api/v1/payments', [
            ...$payload,
            'idempotency_key' => 'idem-payment-api-002',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('payment_reference');
    }

    private function actingWithPermissions(string ...$permissions): User
    {
        $user = User::create([
            'name' => 'Permitted User',
            'email' => 'permitted-user-'.uniqid('', true).'@example.test',
            'password' => 'password',
        ]);

        $this->givePermissions($user, ...$permissions);
        Sanctum::actingAs($user);

        return $user;
    }

    private function givePermissions(User $user, string ...$permissions): void
    {
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
                ['group' => str($permission)->before('.')->toString()],
            );
        }

        $user->givePermissionTo($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function createDonorAndFund(User $user): array
    {
        $donor = Donor::create([
            'name' => 'ABC Telecom',
            'email' => fake()->unique()->safeEmail(),
            'type' => 'organization',
            'status' => 'active',
        ]);

        $fund = Fund::create([
            'code' => 'FND-'.now()->format('YmdHis').'-'.fake()->numberBetween(1000, 9999),
            'name' => 'Education Sponsorship Fund',
            'slug' => 'education-sponsorship-'.now()->timestamp.'-'.fake()->numberBetween(1000, 999999),
            'currency' => 'XAF',
            'restriction_type' => 'education',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        return [$donor, $fund];
    }

    private function createBeneficiaryNeed(): array
    {
        $school = School::create([
            'code' => 'SCH-'.fake()->unique()->numberBetween(1000, 9999),
            'name' => 'API Trace School',
            'verification_status' => 'verified',
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-'.fake()->unique()->numberBetween(1000, 9999),
            'school_id' => $school->id,
            'status' => BeneficiaryStatus::ActiveSupport,
            'first_name' => 'Amina',
            'last_name' => 'Fonyuy',
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

        return [$beneficiary, $need->load('beneficiary')];
    }

    private function createDonation(Donor $donor, Fund $fund, int $amount, array $overrides = []): Donation
    {
        return Donation::create(array_merge([
            'reference_number' => 'DON-'.fake()->unique()->numberBetween(1000, 9999),
            'idempotency_key' => 'idem-'.fake()->unique()->uuid(),
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => $amount,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'provider' => 'manual',
            'provider_reference' => 'BANK-'.fake()->unique()->numberBetween(1000, 9999),
            'status' => DonationStatus::Confirmed,
            'donated_at' => now(),
            'confirmed_at' => now(),
        ], $overrides));
    }
}
