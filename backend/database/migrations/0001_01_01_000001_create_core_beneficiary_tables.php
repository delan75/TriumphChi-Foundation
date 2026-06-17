<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('region')->nullable()->index();
            $table->string('village')->nullable()->index();
            $table->string('address', 500)->nullable();
            $table->string('principal_name')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('email')->nullable();
            $table->string('verification_status')->default('pending')->index();
            $table->timestamps();
        });

        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('source')->index();
            $table->string('status')->default('draft')->index();
            $table->string('applicant_name');
            $table->date('date_of_birth')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone', 40)->nullable();
            $table->string('region')->nullable()->index();
            $table->string('village')->nullable();
            $table->foreignId('school_id')->nullable()->constrained()->nullOnDelete();
            $table->text('needs_assessment')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->string('internal_id')->unique();
            $table->foreignId('application_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('school_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->index();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone', 40)->nullable();
            $table->string('region')->nullable()->index();
            $table->string('village')->nullable();
            $table->string('education_level')->nullable();
            $table->decimal('funding_progress', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('schools');
    }
};

