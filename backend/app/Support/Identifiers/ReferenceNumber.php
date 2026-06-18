<?php

namespace App\Support\Identifiers;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use RuntimeException;

class ReferenceNumber
{
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public static function generate(string $prefix, string $modelClass, string $column, DateTimeInterface|string|null $date = null): string
    {
        if (! is_a($modelClass, Model::class, true)) {
            throw new RuntimeException('Reference numbers can only be generated for Eloquent models.');
        }

        $period = self::periodCode($date);

        for ($attempt = 0; $attempt < 20; $attempt++) {
            $candidate = sprintf('%s-%s%s', $prefix, $period, self::randomSegment(6));

            if (! $modelClass::query()->where($column, $candidate)->exists()) {
                return $candidate;
            }
        }

        throw new RuntimeException("Unable to generate a unique {$prefix} reference.");
    }

    public static function periodCode(DateTimeInterface|string|null $date = null): string
    {
        $date = $date instanceof DateTimeInterface
            ? CarbonImmutable::instance($date)
            : CarbonImmutable::parse($date ?? now());

        return '2'.$date->format('y').self::monthCode((int) $date->format('n'));
    }

    private static function monthCode(int $month): string
    {
        return match ($month) {
            10 => 'A',
            11 => 'B',
            12 => 'C',
            default => (string) $month,
        };
    }

    private static function randomSegment(int $length): string
    {
        $segment = '';
        $max = strlen(self::ALPHABET) - 1;

        for ($i = 0; $i < $length; $i++) {
            $segment .= self::ALPHABET[random_int(0, $max)];
        }

        return $segment;
    }
}
