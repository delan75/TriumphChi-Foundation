<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BeneficiaryStatus;
use App\Http\Controllers\Controller;
use App\Models\Beneficiary;
use App\Models\School;
use Illuminate\Http\JsonResponse;

class PublicImpactController extends Controller
{
    public function __invoke(): JsonResponse
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

        return response()->json([
            'data' => [
                'children_supported' => $childrenSupported,
                'partner_schools' => $partnerSchools,
                'regions_reached' => $regionsReached,
                'school_continuation_rate' => $childrenSupported > 0
                    ? (int) round(($continuingChildren / $childrenSupported) * 100)
                    : null,
            ],
        ]);
    }
}
