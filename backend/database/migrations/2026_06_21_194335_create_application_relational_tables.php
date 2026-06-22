<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('draft_token')->nullable()->unique()->after('status');
            $table->integer('current_step')->default(1)->after('draft_token');
            $table->string('household_income_range')->nullable()->after('needs_assessment');
            $table->integer('household_size')->nullable()->after('household_income_range');
            $table->string('primary_caregiver_occupation')->nullable()->after('household_size');
            $table->json('household_challenges')->nullable()->after('primary_caregiver_occupation');
        });

        Schema::create('application_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->integer('step_number');
            $table->json('data');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['application_id', 'step_number']);
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('document_type')->index();
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->integer('size_bytes')->nullable();
            $table->timestamps();
        });

        Schema::create('application_verification_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('role');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('organization')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('application_education_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_currently_enrolled')->default(false);
            $table->string('school_name')->nullable();
            $table->string('grade_level')->nullable();
            $table->string('distance_to_school')->nullable();
            $table->text('interruption_reasons')->nullable();
            $table->timestamps();
        });

        Schema::create('application_need_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('need_type')->index();
            $table->string('urgency')->nullable();
            $table->text('description')->nullable();
            $table->decimal('estimated_cost', 14, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_need_assessments');
        Schema::dropIfExists('application_education_details');
        Schema::dropIfExists('application_verification_contacts');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('application_steps');
        
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'draft_token',
                'current_step',
                'household_income_range',
                'household_size',
                'primary_caregiver_occupation',
                'household_challenges'
            ]);
        });
    }
};
