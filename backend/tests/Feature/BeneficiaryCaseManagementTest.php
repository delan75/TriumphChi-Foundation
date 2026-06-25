<?php

namespace Tests\Feature;

use App\Models\Allocation;
use App\Models\Beneficiary;
use App\Models\Donor;
use App\Models\EducationalNeed;
use App\Models\Fund;
use App\Models\Payment;
use App\Models\Region;
use App\Models\School;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class BeneficiaryCaseManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_beneficiary_index_requires_view_permission(): void
    {
        Sanctum::actingAs($this->staffUser([]));

        $this->getJson('/api/v1/beneficiaries')
            ->assertForbidden();
    }

    public function test_beneficiary_index_returns_summary_and_filters_case_records(): void
    {
        [$beneficiary] = $this->seedBeneficiaryCase();
        $this->seedBeneficiaryCase([
            'internal_id' => 'BEN-OTHER-001',
            'first_name' => 'Other',
            'last_name' => 'Child',
            'status' => 'graduated',
        ]);

        Sanctum::actingAs($this->staffUser(['beneficiaries.view', 'funds.view', 'payments.view']));

        $this->getJson('/api/v1/beneficiaries?search=Amina&funding_status=funding_gap&limit=10')
            ->assertOk()
            ->assertJsonPath('data.0.uuid', $beneficiary->uuid)
            ->assertJsonPath('data.0.display_name', 'Amina Fonyuy')
            ->assertJsonPath('data.0.case_summary.needs_count', 1)
            ->assertJsonPath('data.0.funding_summary.funding_gap', '50000.00')
            ->assertJsonPath('summary.total_count', 1)
            ->assertJsonPath('summary.funding_gap_count', 1)
            ->assertJsonPath('summary.active_support_count', 1);
    }

    public function test_beneficiary_profile_returns_connected_case_record(): void
    {
        [$beneficiary, $need, $payment, $sponsorship] = $this->seedBeneficiaryCase();

        Sanctum::actingAs($this->staffUser([
            'beneficiaries.view',
            'funds.view',
            'payments.view',
            'donations.view',
            'impact_updates.publish',
        ]));

        $this->getJson("/api/v1/beneficiaries/{$beneficiary->uuid}")
            ->assertOk()
            ->assertJsonPath('data.uuid', $beneficiary->uuid)
            ->assertJsonPath('data.needs.0.uuid', $need->uuid)
            ->assertJsonPath('data.payments.0.uuid', $payment->uuid)
            ->assertJsonPath('data.sponsorships.0.uuid', $sponsorship->uuid)
            ->assertJsonPath('data.funding_summary.amount_required', '75000.00')
            ->assertJsonPath('data.funding_summary.amount_funded', '25000.00')
            ->assertJsonPath('data.permissions.can_view', true)
            ->assertJsonPath('data.permissions.can_view_funding', true)
            ->assertJsonPath('data.permissions.can_publish_updates', true);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array{0: Beneficiary, 1: EducationalNeed, 2: Payment, 3: Sponsorship}
     */
    private function seedBeneficiaryCase(array $overrides = []): array
    {
        $region = Region::firstOrCreate(
            ['name' => $overrides['region_name'] ?? 'North West'],
            ['code' => $overrides['region_code'] ?? 'NW'],
        );

        $school = School::create([
            'code' => $overrides['school_code'] ?? uniqid('SCH-BEN-'),
            'name' => $overrides['school_name'] ?? 'Government School Bamenda',
            'region_id' => $region->id,
            'verification_status' => 'verified',
        ]);

        $beneficiary = Beneficiary::create(array_merge([
            'internal_id' => 'BEN-CASE-001',
            'school_id' => $school->id,
            'region_id' => $region->id,
            'status' => 'active_support',
            'first_name' => 'Amina',
            'last_name' => 'Fonyuy',
            'gender' => 'female',
            'date_of_birth' => now()->subYears(14)->toDateString(),
            'guardian_name' => 'Grace Fonyuy',
            'guardian_phone' => '+237600000001',
            'education_level' => 'Form 3',
            'admission_date' => now()->subYear()->toDateString(),
            'funding_progress' => 33.33,
        ], $overrides));

        $need = EducationalNeed::create([
            'beneficiary_id' => $beneficiary->id,
            'type' => 'school_fees',
            'title' => 'Term school fees',
            'amount_required' => 75000,
            'amount_funded' => 25000,
            'status' => 'partially_funded',
            'academic_year' => '2026',
        ]);

        $fund = Fund::create([
            'code' => 'BEN-FUND-'.$beneficiary->id,
            'name' => 'Beneficiary Support '.$beneficiary->id,
            'slug' => 'beneficiary-support-'.$beneficiary->id,
            'currency' => 'XAF',
            'restriction_type' => 'unrestricted',
            'status' => 'active',
        ]);

        Allocation::create([
            'allocation_reference' => 'ALL-BEN-'.$beneficiary->id,
            'fund_id' => $fund->id,
            'educational_need_id' => $need->id,
            'amount' => 25000,
            'currency' => 'XAF',
            'status' => 'approved',
            'created_by' => $this->staffUser(['allocations.create'])->id,
            'allocated_at' => now(),
        ]);

        $payment = Payment::create([
            'payment_reference' => 'PAY-BEN-'.$beneficiary->id,
            'fund_id' => $fund->id,
            'school_id' => $school->id,
            'beneficiary_id' => $beneficiary->id,
            'educational_need_id' => $need->id,
            'payee_type' => 'school',
            'payee_name' => $school->name,
            'amount' => 25000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'payment_date' => now()->toDateString(),
            'status' => 'paid',
        ]);

        $donor = Donor::create([
            'name' => 'Education Partner',
            'email' => 'partner-'.$beneficiary->id.'@example.org',
            'type' => 'organization',
            'status' => 'active',
        ]);

        $sponsorship = Sponsorship::create([
            'sponsorship_reference' => 'SPN-BEN-'.$beneficiary->id,
            'donor_id' => $donor->id,
            'beneficiary_id' => $beneficiary->id,
            'fund_id' => $fund->id,
            'type' => 'partial',
            'pledged_amount' => 25000,
            'currency' => 'XAF',
            'billing_frequency' => 'one_time',
            'starts_at' => now()->toDateString(),
            'status' => 'active',
        ]);

        return [$beneficiary, $need, $payment, $sponsorship];
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function staffUser(array $permissions): User
    {
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
                ['group' => str($permission)->before('.')->toString()],
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $user = User::create([
            'name' => 'Beneficiary Staff',
            'email' => fake()->unique()->safeEmail(),
            'password' => 'secret-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);

        if ($permissions !== []) {
            $user->givePermissionTo($permissions);
        }

        return $user;
    }
}
