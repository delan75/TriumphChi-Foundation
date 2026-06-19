<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BeneficiaryStatus;
use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use App\Models\School;
use App\Support\ApiResponseTrait;

class PublicImpactController extends Controller
{
    use ApiResponseTrait;

    public function __invoke()
    {
        $childrenSupported = Beneficiary::query()->count();
        $partnerSchools = School::query()->count();
        $regionsReached = Beneficiary::query()
            ->whereNotNull('region_id')
            ->distinct()
            ->count('region_id');

        $continuingStatuses = [
            BeneficiaryStatus::AwaitingSponsorship->value,
            BeneficiaryStatus::PartiallyFunded->value,
            BeneficiaryStatus::FullyFunded->value,
            BeneficiaryStatus::ActiveSupport->value,
            BeneficiaryStatus::Graduated->value,
        ];

        $continuingChildren = Beneficiary::query()
            ->whereIn('status', $continuingStatuses)
            ->count();

        $data = [
            'children_supported' => $childrenSupported,
            'partner_schools' => $partnerSchools,
            'regions_reached' => $regionsReached,
            'school_continuation_rate' => $childrenSupported > 0
                ? (int) round(($continuingChildren / $childrenSupported) * 100)
                : null,
        ];

        return $this->success($data, 'Impact summary retrieved successfully');
    }
}
