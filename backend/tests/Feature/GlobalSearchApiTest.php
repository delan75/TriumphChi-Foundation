<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\ContactMessage;
use App\Models\Donation;
use App\Models\DonationDocument;
use App\Models\Donor;
use App\Models\Fund;
use App\Models\PaymentIntent;
use App\Models\PaymentProvider;
use App\Models\PaymentTransaction;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Lang;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class GlobalSearchApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_search_requires_authentication(): void
    {
        $this->getJson('/api/v1/global-search?q=amina')
            ->assertUnauthorized();
    }

    public function test_global_search_requires_a_meaningful_query(): void
    {
        $this->actingWithPermissions('beneficiaries.view');

        $this->getJson('/api/v1/global-search?q=a')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('q');
    }

    public function test_global_search_returns_only_the_resources_the_user_can_view(): void
    {
        [$application, $beneficiary] = $this->seedSearchRecords();

        $this->actingWithPermissions('beneficiaries.view');

        $response = $this->getJson('/api/v1/global-search?q=amina&limit=10')
            ->assertOk()
            ->assertJsonPath('message', __('api.search.retrieved'))
            ->assertJsonPath('data.meta.returned', 1)
            ->assertJsonPath('data.meta.group_count', 1)
            ->assertJsonPath('data.groups.0.key', 'beneficiaries')
            ->assertJsonPath('data.results.0.resource', 'beneficiaries')
            ->assertJsonPath('data.results.0.reference', $beneficiary->internal_id)
            ->assertJsonPath('data.results.0.title', 'Amina Fonyuy');

        $this->assertSame([$beneficiary->uuid], array_column($response->json('data.results'), 'id'));
        $this->assertNotContains($application->application_number, array_column($response->json('data.results'), 'reference'));
    }

    public function test_global_search_localizes_group_and_status_labels(): void
    {
        [, $beneficiary] = $this->seedSearchRecords();

        $this->actingWithPermissions('beneficiaries.view');

        $this->withHeader('Accept-Language', 'fr')
            ->getJson('/api/v1/global-search?q=amina')
            ->assertOk()
            ->assertJsonPath('message', Lang::get('api.search.retrieved', [], 'fr'))
            ->assertJsonPath('data.groups.0.label', Lang::get('api.search.groups.beneficiaries', [], 'fr'))
            ->assertJsonPath(
                'data.results.0.status_label',
                Lang::get('labels.beneficiary_statuses.'.$beneficiary->status->value, [], 'fr'),
            );
    }

    public function test_global_search_includes_contact_inquiries_only_when_user_has_contact_permission(): void
    {
        $message = ContactMessage::create([
            'name' => 'Pastor Mbah',
            'email' => 'pastor-mbah@example.org',
            'phone' => '+237600000001',
            'reason' => 'church',
            'subject' => 'Church school outreach',
            'message' => 'The church wants to discuss school outreach support.',
            'locale' => 'en',
            'status' => 'new',
        ]);

        $this->actingWithPermissions('beneficiaries.view');

        $this->getJson('/api/v1/global-search?q=outreach&limit=10')
            ->assertOk()
            ->assertJsonMissing(['id' => $message->uuid]);

        $this->actingWithPermissions('contact_messages.view');

        $response = $this->getJson('/api/v1/global-search?q=outreach&limit=10')
            ->assertOk()
            ->assertJsonPath('data.groups.0.key', 'contact_messages')
            ->assertJsonPath('data.results.0.resource', 'contact_messages')
            ->assertJsonPath('data.results.0.id', $message->uuid)
            ->assertJsonPath('data.results.0.title', 'Pastor Mbah')
            ->assertJsonPath('data.results.0.status_label', 'New');

        $this->assertSame('/staff/contacts', $response->json('data.results.0.module_path'));
    }

    public function test_global_search_covers_funding_traces_with_their_required_permissions(): void
    {
        [$intent, $transaction, $document] = $this->seedFundingTraceRecords();

        $this->actingWithPermissions('donations.view');

        $donationResults = $this->getJson('/api/v1/global-search?q=SEARCHTRACE&limit=10')
            ->assertOk()
            ->json('data.results');

        $this->assertContains($intent->uuid, array_column($donationResults, 'id'));
        $this->assertContains($document->uuid, array_column($donationResults, 'id'));
        $this->assertNotContains($transaction->uuid, array_column($donationResults, 'id'));
        $this->assertContains('payment_intents', array_column($donationResults, 'resource'));
        $this->assertContains('donation_documents', array_column($donationResults, 'resource'));

        $this->actingWithPermissions('payments.view');

        $paymentResults = $this->getJson('/api/v1/global-search?q=SEARCHTRACE&limit=10')
            ->assertOk()
            ->json('data.results');

        $this->assertContains($transaction->uuid, array_column($paymentResults, 'id'));
        $this->assertContains('payment_transactions', array_column($paymentResults, 'resource'));
        $this->assertNotContains($intent->uuid, array_column($paymentResults, 'id'));
    }

    private function actingWithPermissions(string ...$permissions): User
    {
        $user = User::create([
            'name' => 'Search User',
            'email' => 'search-user-'.uniqid('', true).'@example.test',
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

    private function seedSearchRecords(): array
    {
        $school = School::create([
            'code' => 'SCH-SEARCH-001',
            'name' => 'Hope Bilingual School',
            'verification_status' => 'verified',
        ]);

        $application = Application::create([
            'application_number' => 'APP-SEARCH-001',
            'source' => 'school',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'Amina Applicant',
            'guardian_name' => 'Grace Applicant',
            'school_id' => $school->id,
            'submitted_at' => now(),
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-SEARCH-001',
            'school_id' => $school->id,
            'status' => BeneficiaryStatus::ActiveSupport,
            'first_name' => 'Amina',
            'last_name' => 'Fonyuy',
            'guardian_name' => 'Grace Fonyuy',
        ]);

        Donor::create([
            'name' => 'Amina Community Trust',
            'email' => 'donor-search@example.test',
            'type' => 'organization',
            'status' => 'active',
        ]);

        return [$application, $beneficiary];
    }

    private function seedFundingTraceRecords(): array
    {
        $donor = Donor::create([
            'name' => 'Search Trace Donor',
            'email' => 'trace-donor@example.test',
            'type' => 'individual',
            'status' => 'active',
        ]);

        $fund = Fund::create([
            'code' => 'SEARCHTRACE-FUND',
            'name' => 'Search Trace Fund',
            'slug' => 'search-trace-fund',
            'currency' => 'USD',
            'restriction_type' => 'unrestricted',
            'status' => 'active',
        ]);

        $donation = Donation::create([
            'reference_number' => 'DON-SEARCHTRACE-001',
            'donor_id' => $donor->id,
            'fund_id' => $fund->id,
            'amount' => 250,
            'currency' => 'USD',
            'method' => 'paypal',
            'provider' => 'paypal',
            'status' => 'pending',
        ]);

        $provider = PaymentProvider::create([
            'key' => 'paypal-searchtrace',
            'name' => 'PayPal Search Trace',
            'method' => 'paypal',
            'category' => 'wallet',
            'status' => 'active',
            'currencies' => ['USD'],
        ]);

        $intent = PaymentIntent::create([
            'intent_reference' => 'PINT-SEARCHTRACE-001',
            'donation_id' => $donation->id,
            'payment_provider_id' => $provider->id,
            'amount' => 250,
            'currency' => 'USD',
            'frequency' => 'one_time',
            'purpose' => 'greatest_need',
            'status' => 'processing',
            'provider_intent_id' => 'SEARCHTRACE-ORDER-001',
        ]);

        $transaction = PaymentTransaction::create([
            'payment_intent_id' => $intent->id,
            'donation_id' => $donation->id,
            'payment_provider_id' => $provider->id,
            'transaction_reference' => 'PTXN-SEARCHTRACE-001',
            'provider_transaction_id' => 'SEARCHTRACE-CAPTURE-001',
            'type' => 'paypal_capture',
            'status' => 'completed',
            'amount' => 250,
            'currency' => 'USD',
            'processed_at' => now(),
        ]);

        $document = DonationDocument::create([
            'donation_id' => $donation->id,
            'document_number' => 'REC-SEARCHTRACE-001',
            'type' => 'receipt',
            'status' => 'issued',
            'locale' => 'en',
            'title' => 'Search Trace Receipt',
            'snapshot' => [],
            'path' => 'donation-documents/searchtrace.pdf',
            'issued_at' => now(),
        ]);

        return [$intent, $transaction, $document];
    }
}
