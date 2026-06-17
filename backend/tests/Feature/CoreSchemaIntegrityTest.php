<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Enums\NeedStatus;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\DeletionRequest;
use App\Models\EducationalNeed;
use App\Models\Region;
use App\Models\School;
use App\Models\User;
use App\Models\Village;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoreSchemaIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_core_geography_beneficiary_and_need_relationships_are_enforced(): void
    {
        $region = Region::create([
            'name' => 'Centre',
            'code' => 'CE',
        ]);

        $village = Village::create([
            'region_id' => $region->id,
            'name' => 'Obala',
        ]);

        $school = School::create([
            'code' => 'SCH-001',
            'name' => 'Government Bilingual High School',
            'region_id' => $region->id,
            'village_id' => $village->id,
            'verification_status' => 'verified',
        ]);

        $application = Application::create([
            'application_number' => 'APP-001',
            'source' => 'school',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'Aline Mballa',
            'region_id' => $region->id,
            'village_id' => $village->id,
            'school_id' => $school->id,
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-001',
            'application_id' => $application->id,
            'school_id' => $school->id,
            'region_id' => $region->id,
            'village_id' => $village->id,
            'status' => BeneficiaryStatus::AwaitingSponsorship,
            'first_name' => 'Aline',
            'last_name' => 'Mballa',
        ]);

        $need = EducationalNeed::create([
            'beneficiary_id' => $beneficiary->id,
            'type' => 'school_fees',
            'title' => 'First term school fees',
            'amount_required' => 75000,
            'amount_funded' => 0,
            'status' => NeedStatus::Open,
            'academic_year' => '2026-2027',
        ]);

        $this->assertTrue($region->schools()->whereKey($school->id)->exists());
        $this->assertTrue($village->beneficiaries()->whereKey($beneficiary->id)->exists());
        $this->assertTrue($school->applications()->whereKey($application->id)->exists());
        $this->assertTrue($application->beneficiary()->whereKey($beneficiary->id)->exists());
        $this->assertTrue($beneficiary->needs()->whereKey($need->id)->exists());
    }

    public function test_application_can_only_link_to_one_beneficiary(): void
    {
        $application = Application::create([
            'application_number' => 'APP-002',
            'source' => 'field_officer',
            'status' => ApplicationStatus::Accepted,
            'applicant_name' => 'Marie Ngo',
        ]);

        Beneficiary::create([
            'internal_id' => 'BEN-002',
            'application_id' => $application->id,
            'status' => BeneficiaryStatus::AwaitingSponsorship,
            'first_name' => 'Marie',
            'last_name' => 'Ngo',
        ]);

        $this->expectException(QueryException::class);

        Beneficiary::create([
            'internal_id' => 'BEN-003',
            'application_id' => $application->id,
            'status' => BeneficiaryStatus::AwaitingSponsorship,
            'first_name' => 'Mireille',
            'last_name' => 'Ngo',
        ]);
    }

    public function test_soft_deletes_preserve_sensitive_core_records(): void
    {
        $school = School::create([
            'code' => 'SCH-002',
            'name' => 'Hope Primary School',
            'verification_status' => 'pending',
        ]);

        $beneficiary = Beneficiary::create([
            'internal_id' => 'BEN-004',
            'school_id' => $school->id,
            'status' => BeneficiaryStatus::ActiveSupport,
            'first_name' => 'Paul',
            'last_name' => 'Talla',
        ]);

        $school->delete();
        $beneficiary->delete();

        $this->assertSoftDeleted('schools', ['id' => $school->id]);
        $this->assertSoftDeleted('beneficiaries', ['id' => $beneficiary->id]);
    }

    public function test_status_history_and_deletion_requests_capture_governance_data(): void
    {
        $user = User::create([
            'name' => 'Program Lead',
            'email' => 'lead@example.org',
            'password' => bcrypt('password'),
        ]);

        $application = Application::create([
            'application_number' => 'APP-003',
            'source' => 'ngo_staff',
            'status' => ApplicationStatus::Submitted,
            'applicant_name' => 'Jean Atem',
        ]);

        $application->statusHistory()->create([
            'from_status' => ApplicationStatus::Submitted->value,
            'to_status' => ApplicationStatus::VerificationPending->value,
            'changed_by' => $user->id,
            'changed_at' => now(),
            'reason' => 'documents_received',
            'notes' => 'Ready for field verification.',
            'ip_address' => '127.0.0.1',
        ]);

        DeletionRequest::create([
            'entity_type' => Beneficiary::class,
            'entity_id' => 123,
            'classification' => 'restricted',
            'requested_by' => $user->id,
            'status' => 'requested',
            'reason' => 'Duplicate intake record.',
        ]);

        $this->assertDatabaseHas('application_status_history', [
            'application_id' => $application->id,
            'from_status' => 'submitted',
            'to_status' => 'verification_pending',
            'changed_by' => $user->id,
        ]);

        $this->assertDatabaseHas('deletion_requests', [
            'entity_type' => Beneficiary::class,
            'entity_id' => 123,
            'classification' => 'restricted',
            'requested_by' => $user->id,
            'status' => 'requested',
        ]);
    }

    public function test_region_with_villages_hard_delete_is_prevented_by_constraint(): void
    {
        $region = Region::create(['name' => 'Littoral']);

        Village::create([
            'region_id' => $region->id,
            'name' => 'Bonaberi',
        ]);

        $this->expectException(QueryException::class);

        $region->delete();
    }
}
