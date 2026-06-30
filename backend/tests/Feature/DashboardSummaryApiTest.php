<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\Donor;
use App\Models\Fund;
use App\Models\ImpactUpdate;
use App\Models\Payment;
use App\Models\School;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Lang;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class DashboardSummaryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_summary_requires_authentication(): void
    {
        $this->getJson('/api/v1/dashboard/summary')
            ->assertUnauthorized();
    }

    public function test_dashboard_summary_is_permission_aware(): void
    {
        $seed = $this->seedDashboardRecords();

        $this->actingWithPermissions('applications.view', 'beneficiaries.view');

        $response = $this->getJson('/api/v1/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('message', __('api.dashboard.retrieved'));

        $metricKeys = array_column($response->json('data.metrics'), 'key');
        $queueKeys = array_column($response->json('data.priority_queues'), 'key');
        $moduleKeys = $response->json('data.snapshot.accessible_modules');

        $this->assertContains('applications_pending_review', $metricKeys);
        $this->assertContains('beneficiaries_supported', $metricKeys);
        $this->assertNotContains('schools_connected', $metricKeys);
        $this->assertNotContains('funding_awaiting_allocation', $metricKeys);

        $this->assertContains('applications_verification', $queueKeys);
        $this->assertContains('beneficiaries_awaiting_sponsorship', $queueKeys);
        $this->assertNotContains('payments_pending_approval', $queueKeys);

        $this->assertContains('applications', $moduleKeys);
        $this->assertContains('beneficiaries', $moduleKeys);
        $this->assertNotContains('funding', $moduleKeys);

        $this->assertSame($seed['application']->application_number, $response->json('data.priority_queues.0.items.0.reference'));

        $activity = collect($response->json('data.recent_activity'))
            ->firstWhere('reference', $seed['application']->application_number);

        $this->assertNotNull($activity);
        $this->assertSame($seed['application']->uuid, $activity['id']);
        $this->assertSame('application', $activity['type']);
        $this->assertSame('application', $activity['key']);
        $this->assertSame('application', $activity['icon']);
        $this->assertSame($activity['happened_at'], $activity['occurred_at']);
        $this->assertSame('/staff/applications?search='.$seed['application']->application_number, $activity['path']);
    }

    public function test_dashboard_summary_localizes_queue_labels(): void
    {
        $seed = $this->seedDashboardRecords();

        $this->actingWithPermissions('applications.view', 'beneficiaries.view', 'impact_updates.view');

        $this->withHeader('Accept-Language', 'fr')
            ->getJson('/api/v1/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('message', Lang::get('api.dashboard.retrieved', [], 'fr'))
            ->assertJsonPath(
                'data.priority_queues.0.items.0.status_label',
                Lang::get('labels.application_statuses.'.$seed['application']->status->value, [], 'fr'),
            );
    }

    private function actingWithPermissions(string ...$permissions): User
    {
        $user = User::create([
            'name' => 'Dashboard User',
            'email' => 'dashboard-user-'.uniqid('', true).'@example.test',
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

    private function seedDashboardRecords(): array
    {
        $staff = User::create([
            'name' => 'Staff Seed',
            'email' => 'staff-seed@example.test',
            'password' => 'password',
        ]);

        $school = School::create([
            'code' => 'SCH-DASH-001',
            'name' => 'Grace Academy',
            'verification_status' => 'verified',
        ]);

        $application = Application::create([
            'application_number' => 'APP-DASH-001',
            'source' => 'school',
            'status' => ApplicationStatus::VerificationPending,
            'applicant_name' => 'John Neba',
            'school_id' => $school->id,
            'submitted_at' => now(),
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-DASH-001',
            'school_id' => $school->id,
            'status' => BeneficiaryStatus::AwaitingSponsorship,
            'first_name' => 'Mercy',
            'last_name' => 'Tanyi',
            'admission_date' => now()->toDateString(),
        ]);

        ImpactUpdate::create([
            'beneficiary_id' => $beneficiary->id,
            'title' => 'Recent visit',
            'body' => 'The child is progressing well.',
            'visibility' => 'private',
        ]);

        $donor = Donor::create([
            'name' => 'Hope Partners',
            'email' => 'hope-partners@example.test',
            'type' => 'organization',
            'status' => 'active',
        ]);

        $fund = Fund::create([
            'code' => 'FND-DASH-001',
            'name' => 'School Needs Fund',
            'slug' => 'school-needs-fund',
            'currency' => 'XAF',
            'restriction_type' => 'education',
            'status' => 'active',
            'created_by' => $staff->id,
        ]);

        $donation = Donation::create([
            'reference_number' => 'DON-DASH-001',
            'idempotency_key' => 'idem-dash-001',
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => 50000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'provider' => 'manual',
            'provider_reference' => 'BANK-DASH-001',
            'status' => 'confirmed',
            'donated_at' => now(),
            'confirmed_at' => now(),
        ]);

        Sponsorship::create([
            'sponsorship_reference' => 'SPN-DASH-001',
            'donor_id' => $donor->id,
            'beneficiary_id' => $beneficiary->id,
            'fund_id' => $fund->id,
            'type' => 'recurring',
            'pledged_amount' => 25000,
            'currency' => 'XAF',
            'billing_frequency' => 'monthly',
            'starts_at' => now()->toDateString(),
            'status' => 'active',
        ]);

        Payment::create([
            'payment_reference' => 'PAY-DASH-001',
            'idempotency_key' => 'idem-pay-dash-001',
            'fund_id' => $fund->id,
            'school_id' => $school->id,
            'beneficiary_id' => $beneficiary->id,
            'payee_type' => 'school',
            'payee_name' => 'Grace Academy',
            'amount' => 25000,
            'currency' => 'XAF',
            'method' => 'bank_transfer',
            'payment_date' => now()->toDateString(),
            'status' => 'pending',
        ]);

        return [
            'application' => $application,
            'beneficiary' => $beneficiary,
            'donation' => $donation,
        ];
    }
}
