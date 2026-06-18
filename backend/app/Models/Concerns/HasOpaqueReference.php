<?php

namespace App\Models\Concerns;

use App\Support\Identifiers\ReferenceNumber;

trait HasOpaqueReference
{
    protected static function bootHasOpaqueReference(): void
    {
        static::creating(function ($model): void {
            $column = $model->referenceColumn();

            if (empty($model->{$column})) {
                $model->{$column} = ReferenceNumber::generate(
                    $model->referencePrefix(),
                    $model::class,
                    $column,
                    $model->referenceDateValue(),
                );
            }
        });
    }
}
