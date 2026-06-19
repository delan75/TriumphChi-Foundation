<?php

namespace Tests\Feature;

use App\Models\Beneficiary;
use App\Models\Region;
use App\Models\School;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicImpactSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_impact_summary_returns_aggregate_counts_without_authentication(): void
    {
        $region = Region::create([
            'code' => 'NW',
            'name' => 'North West',
        ]);

        $school = School::create([
            'code' => 'SCH-001',
            'name' => 'Community Primary School',
            'region_id' => $region->id,
            'verification_status' => 'verified',
        ]);

        Beneficiary::create([
            'internal_id' => 'BEN-2265ABCD01',
            'school_id' => $school->id,
            'region_id' => $region->id,
            'status' => 'active_support',
            'first_name' => 'Ada',
            'last_name' => 'Hope',
        ]);

        Beneficiary::create([
            'internal_id' => 'BEN-2265ABCD02',
            'school_id' => $school->id,
            'region_id' => $region->id,
            'status' => 'archived',
            'first_name' => 'Jean',
            'last_name' => 'Care',
        ]);

        $this->getJson('/api/v1/public/impact-summary')
            ->assertOk()
            ->assertJsonPath('data.children_supported', 2)
            ->assertJsonPath('data.partner_schools', 1)
            ->assertJsonPath('data.regions_reached', 1)
            ->assertJsonPath('data.school_continuation_rate', 50)
            ->assertJsonMissing(['Ada', 'Hope', 'Jean', 'Care']);
    }

    public function test_public_impact_summary_returns_null_rate_when_no_children_exist(): void
    {
        $this->getJson('/api/v1/public/impact-summary')
            ->assertOk()
            ->assertJsonPath('data.children_supported', 0)
            ->assertJsonPath('data.partner_schools', 0)
            ->assertJsonPath('data.regions_reached', 0)
            ->assertJsonPath('data.school_continuation_rate', null);
    }
}
