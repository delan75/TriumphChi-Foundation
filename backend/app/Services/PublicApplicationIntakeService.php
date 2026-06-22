<?php

namespace App\Services;

use App\Models\Region;
use App\Models\School;
use App\Models\Village;
use App\Support\Identifiers\ReferenceNumber;
use Illuminate\Support\Str;

class PublicApplicationIntakeService
{
    /**
     * @return array{region: ?Region, village: ?Village, school: ?School}
     */
    public function resolveLocationAndSchool(?string $regionName, ?string $villageName, ?string $schoolName): array
    {
        $region = $this->resolveRegion($regionName);
        $village = $this->resolveVillage($villageName, $region);
        $school = $this->resolveSchool($schoolName, $region, $village);

        return compact('region', 'village', 'school');
    }

    /**
     * @return array<int, array{id:int, label:string, secondary?: string}>
     */
    public function suggest(string $type, ?string $query = null, ?string $regionName = null, ?string $villageName = null): array
    {
        $normalizedQuery = $this->normalize($query);

        return match ($type) {
            'regions' => $this->suggestRegions($normalizedQuery),
            'villages' => $this->suggestVillages($normalizedQuery, $regionName),
            'schools' => $this->suggestSchools($normalizedQuery, $regionName, $villageName),
            default => [],
        };
    }

    private function resolveRegion(?string $name): ?Region
    {
        $normalized = $this->normalize($name);

        if ($normalized === null) {
            return null;
        }

        $region = Region::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($normalized)])
            ->first();

        if ($region) {
            return $region;
        }

        return Region::create([
            'name' => $normalized,
            'code' => ReferenceNumber::generate('REG', Region::class, 'code'),
            'status' => 'active',
        ]);
    }

    private function resolveVillage(?string $name, ?Region $region): ?Village
    {
        $normalized = $this->normalize($name);

        if ($normalized === null) {
            return null;
        }

        $query = Village::query()->whereRaw('LOWER(name) = ?', [mb_strtolower($normalized)]);

        if ($region) {
            $query->where('region_id', $region->id);
        }

        $village = $query->first();

        if ($village) {
            return $village;
        }

        return Village::create([
            'region_id' => $region?->id,
            'name' => $normalized,
            'status' => 'active',
        ]);
    }

    private function resolveSchool(?string $name, ?Region $region, ?Village $village): ?School
    {
        $normalized = $this->normalize($name);

        if ($normalized === null) {
            return null;
        }

        $query = School::query()->whereRaw('LOWER(name) = ?', [mb_strtolower($normalized)]);

        if ($region) {
            $query->where('region_id', $region->id);
        }

        if ($village) {
            $query->where('village_id', $village->id);
        }

        $school = $query->first();

        if ($school) {
            return $school;
        }

        return School::create([
            'code' => ReferenceNumber::generate('SCH', School::class, 'code'),
            'name' => $normalized,
            'region_id' => $region?->id,
            'village_id' => $village?->id,
            'verification_status' => 'pending',
        ]);
    }

    /**
     * @return array<int, array{id:int, label:string, secondary?: string}>
     */
    private function suggestRegions(?string $query): array
    {
        return Region::query()
            ->when($query, fn ($builder) => $builder->where('name', 'like', '%'.$query.'%'))
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (Region $region) => [
                'id' => $region->id,
                'label' => $region->name,
                'secondary' => $region->code,
            ])
            ->all();
    }

    /**
     * @return array<int, array{id:int, label:string, secondary?: string}>
     */
    private function suggestVillages(?string $query, ?string $regionName): array
    {
        return Village::query()
            ->with('region')
            ->when($query, fn ($builder) => $builder->where('name', 'like', '%'.$query.'%'))
            ->when($this->normalize($regionName), function ($builder, string $normalizedRegion) {
                $builder->whereHas('region', function ($regionQuery) use ($normalizedRegion): void {
                    $regionQuery->whereRaw('LOWER(name) = ?', [mb_strtolower($normalizedRegion)]);
                });
            })
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (Village $village) => [
                'id' => $village->id,
                'label' => $village->name,
                'secondary' => $village->region?->name,
            ])
            ->all();
    }

    /**
     * @return array<int, array{id:int, label:string, secondary?: string}>
     */
    private function suggestSchools(?string $query, ?string $regionName, ?string $villageName): array
    {
        return School::query()
            ->with(['region', 'village'])
            ->when($query, fn ($builder) => $builder->where('name', 'like', '%'.$query.'%'))
            ->when($this->normalize($regionName), function ($builder, string $normalizedRegion) {
                $builder->whereHas('region', function ($regionQuery) use ($normalizedRegion): void {
                    $regionQuery->whereRaw('LOWER(name) = ?', [mb_strtolower($normalizedRegion)]);
                });
            })
            ->when($this->normalize($villageName), function ($builder, string $normalizedVillage) {
                $builder->whereHas('village', function ($villageQuery) use ($normalizedVillage): void {
                    $villageQuery->whereRaw('LOWER(name) = ?', [mb_strtolower($normalizedVillage)]);
                });
            })
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (School $school) => [
                'id' => $school->id,
                'label' => $school->name,
                'secondary' => trim(collect([$school->village?->name, $school->region?->name])->filter()->join(' • ')),
            ])
            ->all();
    }

    private function normalize(?string $value): ?string
    {
        $normalized = trim(preg_replace('/\s+/', ' ', (string) $value) ?? '');

        return $normalized === '' ? null : Str::of($normalized)->squish()->toString();
    }
}
