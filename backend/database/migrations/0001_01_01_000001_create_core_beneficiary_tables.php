<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code', 40)->nullable()->unique();
            $table->string('status')->default('active')->index();
            $table->timestamps();
        });

        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('status')->default('active')->index();
            $table->timestamps();

            $table->unique(['region_id', 'name']);
            $table->index(['region_id', 'status']);
        });

        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();
            $table->string('address', 500)->nullable();
            $table->string('principal_name')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('email')->nullable();
            $table->string('verification_status')->default('pending')->index();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['region_id', 'verification_status']);
            $table->index(['village_id', 'verification_status']);
        });

        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->string('source')->index();
            $table->string('status')->default('draft')->index();
            $table->string('applicant_name');
            $table->string('gender', 40)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone', 40)->nullable();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('school_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('needs_assessment')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'submitted_at']);
            $table->index(['school_id', 'status']);
            $table->index(['region_id', 'status']);
            $table->index('submitted_by');
        });

        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->string('internal_id')->unique();
            $table->foreignId('application_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->foreignId('school_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->index();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('gender', 40)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone', 40)->nullable();
            $table->string('education_level')->nullable();
            $table->date('admission_date')->nullable();
            $table->date('graduation_date')->nullable();
            $table->decimal('funding_progress', 5, 2)->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['school_id', 'status']);
            $table->index(['region_id', 'status']);
            $table->index(['last_name', 'first_name']);
        });

        Schema::create('educational_needs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained()->restrictOnDelete();
            $table->string('type')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount_required', 14, 2);
            $table->decimal('amount_funded', 14, 2)->default(0);
            $table->string('status')->index();
            $table->string('academic_year', 20)->index();
            $table->date('funding_starts_at')->nullable();
            $table->date('funding_ends_at')->nullable();
            $table->timestamps();

            $table->index(['beneficiary_id', 'status']);
            $table->index(['status', 'academic_year']);
            $table->index(['type', 'status']);
        });

        Schema::create('application_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('changed_at');
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();

            $table->index(['application_id', 'changed_at']);
            $table->index(['to_status', 'changed_at']);
            $table->index(['changed_by', 'changed_at']);
        });

        Schema::create('beneficiary_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('changed_at');
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();

            $table->index(['beneficiary_id', 'changed_at']);
            $table->index(['to_status', 'changed_at']);
            $table->index(['changed_by', 'changed_at']);
        });

        Schema::create('deletion_requests', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id');
            $table->string('classification')->index();
            $table->foreignId('requested_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('requested')->index();
            $table->text('reason');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
            $table->index(['status', 'created_at']);
            $table->index(['requested_by', 'created_at']);
            $table->index(['approved_by', 'approved_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deletion_requests');
        Schema::dropIfExists('beneficiary_status_history');
        Schema::dropIfExists('application_status_history');
        Schema::dropIfExists('educational_needs');
        Schema::dropIfExists('beneficiaries');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('schools');
        Schema::dropIfExists('villages');
        Schema::dropIfExists('regions');
    }
};
