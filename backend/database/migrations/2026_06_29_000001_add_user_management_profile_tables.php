<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->uuid('uuid')->nullable()->unique()->after('id');
            $table->string('employee_number', 40)->nullable()->unique()->after('uuid');
        });

        DB::table('users')
            ->whereNull('uuid')
            ->orderBy('id')
            ->select('id')
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update(['uuid' => (string) Str::uuid()]);
                }
            });

        Schema::create('user_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('department')->nullable()->index();
            $table->string('position')->nullable()->index();
            $table->string('employment_type')->nullable()->index();
            $table->string('office_location')->nullable()->index();
            $table->date('joined_foundation_at')->nullable()->index();
            $table->text('bio')->nullable();
            $table->json('skills')->nullable();
            $table->json('languages')->nullable();
            $table->json('certifications')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 50)->nullable();
            $table->timestamps();

            $table->index(['department', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['employee_number']);
            $table->dropUnique(['uuid']);
            $table->dropColumn(['uuid', 'employee_number']);
        });
    }
};
