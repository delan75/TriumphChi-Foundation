<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Enums\DonationStatus;
use App\Enums\NeedStatus;
use App\Models\Allocation;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\Donor;
use App\Models\EducationalNeed;
use App\Models\Fund;
use App\Models\Payment;
use App\Models\School;
use App\Models\Sponsorship;
use App\Models\User;
use App\Support\Identifiers\ReferenceNumber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class PublicIdentifierTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_application_numbers_are_opaque_and_applications_resolve_by_uuid(): void
    {
        Carbon::setTestNow('2026-05-18 10:00:00');
        $this->actingWithPermissions('applications.view');

        $first = Application::create([
            'source' => 'school',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'Aline Mballa',
        ]);

        $second = Application::create([
            'source' => 'school',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'Marie Ngo',
        ]);

        $this->assertMatchesRegularExpression('/^APP-2265[A-HJ-NP-Z2-9]{6}$/', $first->application_number);
        $this->assertMatchesRegularExpression('/^APP-2265[A-HJ-NP-Z2-9]{6}$/', $second->application_number);
        $this->assertNotSame($first->application_number, $second->application_number);
        $this->assertNotNull($first->uuid);

        $this->getJson("/api/v1/applications/{$first->uuid}")
            ->assertOk()
            ->assertJsonPath('data.uuid', $first->uuid)
            ->assertJsonPath('data.application_number', $first->application_number);

        $this->getJson("/api/v1/applications/{$first->id}")
            ->assertNotFound();
    }

    public function test_financial_references_are_generated_and_donations_resolve_by_uuid(): void
    {
        Carbon::setTestNow('2026-05-18 10:00:00');
        $user = $this->actingWithPermissions('donations.view');
        [$donor, $fund, $need] = $this->createFundingChain($user);

        $donation = Donation::create([
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => 100000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'status' => DonationStatus::Confirmed,
            'donated_at' => now(),
            'confirmed_at' => now(),
        ]);

        $allocation = Allocation::create([
            'donation_id' => $donation->id,
            'fund_id' => $fund->id,
            'educational_need_id' => $need->id,
            'amount' => 50000,
            'currency' => 'XAF',
            'status' => 'approved',
            'allocated_at' => now(),
            'created_by' => $user->id,
            'approved_by' => $user->id,
        ]);

        $payment = Payment::create([
            'fund_id' => $fund->id,
            'beneficiary_id' => $need->beneficiary_id,
            'educational_need_id' => $need->id,
            'payee_type' => 'school',
            'payee_name' => 'API Trace School',
            'amount' => 50000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'payment_date' => now()->toDateString(),
            'status' => 'paid',
        ]);

        $sponsorship = Sponsorship::create([
            'donor_id' => $donor->id,
            'beneficiary_id' => $need->beneficiary_id,
            'fund_id' => $fund->id,
            'type' => 'partial',
            'pledged_amount' => 50000,
            'currency' => 'XAF',
            'starts_at' => now()->toDateString(),
            'status' => 'active',
        ]);

        $this->assertMatchesRegularExpression('/^DON-2265[A-HJ-NP-Z2-9]{6}$/', $donation->reference_number);
        $this->assertMatchesRegularExpression('/^ALL-2265[A-HJ-NP-Z2-9]{6}$/', $allocation->allocation_reference);
        $this->assertMatchesRegularExpression('/^PAY-2265[A-HJ-NP-Z2-9]{6}$/', $payment->payment_reference);
        $this->assertMatchesRegularExpression('/^SPN-2265[A-HJ-NP-Z2-9]{6}$/', $sponsorship->sponsorship_reference);
        $this->assertSame('226A', ReferenceNumber::periodCode('2026-10-01'));

        $this->getJson("/api/v1/donations/{$donation->uuid}")
            ->assertOk()
            ->assertJsonPath('data.uuid', $donation->uuid)
            ->assertJsonPath('data.reference_number', $donation->reference_number);

        $this->getJson("/api/v1/donations/{$donation->id}")
            ->assertNotFound();
    }

    private function actingWithPermissions(string ...$permissions): User
    {
        $user = User::create([
            'name' => 'Permitted User',
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
        ]);

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
                ['group' => str($permission)->before('.')->toString()],
            );
        }

        $user->givePermissionTo($permissions);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Sanctum::actingAs($user);

        return $user;
    }

    private function createFundingChain(User $user): array
    {
        $donor = Donor::create([
            'name' => 'ABC Telecom',
            'email' => fake()->unique()->safeEmail(),
            'type' => 'organization',
            'status' => 'active',
        ]);

        $fund = Fund::create([
            'code' => 'FND-'.fake()->unique()->numberBetween(1000, 9999),
            'name' => 'Education Sponsorship Fund',
            'slug' => 'education-sponsorship-'.fake()->unique()->numberBetween(1000, 9999),
            'currency' => 'XAF',
            'restriction_type' => 'education',
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $school = School::create([
            'code' => 'SCH-'.fake()->unique()->numberBetween(1000, 9999),
            'name' => 'API Trace School',
            'verification_status' => 'verified',
        ]);

        $beneficiary = Beneficiary::create([
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

        return [$donor, $fund, $need];
    }
}
