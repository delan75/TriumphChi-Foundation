<?php

namespace App\Services;

use App\Enums\ApplicationStatus;
use App\Enums\BeneficiaryStatus;
use App\Models\Application;
use App\Models\Beneficiary;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApplicationBeneficiaryService
{
    public function createFromAcceptedApplication(Application $application, ?int $actorId = null, ?string $ipAddress = null, ?string $notes = null): Beneficiary
    {
        return DB::transaction(function () use ($application, $actorId, $ipAddress, $notes): Beneficiary {
            $application = Application::query()
                ->with(['educationDetails', 'needAssessments'])
                ->whereKey($application->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($application->status !== ApplicationStatus::Accepted) {
                throw new DomainException('Beneficiaries can only be created from accepted applications.');
            }

            $existing = $application->beneficiary()->first();

            if ($existing) {
                return $existing;
            }

            [$firstName, $lastName] = $this->splitName($application->applicant_name);

            $beneficiary = Beneficiary::create([
                'application_id' => $application->id,
                'school_id' => $application->school_id,
                'region_id' => $application->region_id,
                'village_id' => $application->village_id,
                'status' => BeneficiaryStatus::ActiveSupport,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'gender' => $application->gender,
                'date_of_birth' => $application->date_of_birth,
                'guardian_name' => $application->guardian_name,
                'guardian_phone' => $application->guardian_phone,
                'education_level' => $this->educationLevel($application),
                'admission_date' => now()->toDateString(),
                'funding_progress' => 0,
            ]);

            $beneficiary->statusHistory()->create([
                'from_status' => null,
                'to_status' => BeneficiaryStatus::ActiveSupport->value,
                'changed_by' => $actorId,
                'changed_at' => now(),
                'reason' => 'application_accepted',
                'notes' => $notes,
                'ip_address' => $ipAddress,
            ]);

            $this->createInitialNeeds($application, $beneficiary);

            return $beneficiary->refresh();
        });
    }

    private function splitName(?string $name): array
    {
        $parts = preg_split('/\s+/', trim((string) $name), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if ($parts === []) {
            return ['Unknown', 'Beneficiary'];
        }

        if (count($parts) === 1) {
            return [$parts[0], ''];
        }

        return [array_shift($parts), implode(' ', $parts)];
    }

    private function educationLevel(Application $application): ?string
    {
        return $application->educationDetails?->grade_level
            ?? data_get($application->intake_payload, 'grade_level')
            ?? data_get($application->intake_payload, 'current_class')
            ?? data_get($application->intake_payload, 'class_level');
    }

    private function createInitialNeeds(Application $application, Beneficiary $beneficiary): void
    {
        $needs = $application->needAssessments
            ->filter(fn ($need) => filled($need->estimated_cost) && (float) $need->estimated_cost > 0);

        foreach ($needs as $need) {
            $beneficiary->needs()->create([
                'type' => $need->need_type,
                'title' => Str::headline($need->need_type),
                'description' => $need->description,
                'amount_required' => $need->estimated_cost,
                'amount_funded' => 0,
                'status' => 'open',
                'academic_year' => $this->academicYear(),
            ]);
        }
    }

    private function academicYear(): string
    {
        $now = now();

        if ($now->month >= 8) {
            return $now->year.'/'.($now->year + 1);
        }

        return ($now->year - 1).'/'.$now->year;
    }
}
