<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private array $tables = [
        'schools',
        'applications',
        'beneficiaries',
        'educational_needs',
        'donors',
        'funds',
        'donations',
        'allocations',
        'sponsorships',
        'payments',
        'impact_updates',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->uuid('uuid')->nullable()->unique();
            });

            DB::table($tableName)
                ->whereNull('uuid')
                ->orderBy('id')
                ->select('id')
                ->chunkById(100, function ($rows) use ($tableName): void {
                    foreach ($rows as $row) {
                        DB::table($tableName)
                            ->where('id', $row->id)
                            ->update(['uuid' => (string) Str::uuid()]);
                    }
                });
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->tables) as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn('uuid');
            });
        }
    }
};
