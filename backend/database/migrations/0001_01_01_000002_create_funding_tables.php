<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone', 40)->nullable();
            $table->string('type')->default('individual')->index();
            $table->json('communication_preferences')->nullable();
            $table->timestamps();
        });

        Schema::create('funds', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('balance', 14, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->foreignId('donor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fund_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 14, 2);
            $table->char('currency', 3)->default('XAF');
            $table->string('method')->index();
            $table->string('status')->index();
            $table->timestamp('donated_at')->nullable();
            $table->string('receipt_path', 500)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('educational_needs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount_required', 14, 2);
            $table->decimal('amount_funded', 14, 2)->default(0);
            $table->string('status')->index();
            $table->date('funding_starts_at')->nullable();
            $table->date('funding_ends_at')->nullable();
            $table->timestamps();
        });

        Schema::create('allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fund_id')->constrained()->restrictOnDelete();
            $table->foreignId('educational_need_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 14, 2);
            $table->text('reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('sponsorships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('beneficiary_id')->constrained()->cascadeOnDelete();
            $table->string('type')->index();
            $table->decimal('pledged_amount', 14, 2);
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->string('status')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsorships');
        Schema::dropIfExists('allocations');
        Schema::dropIfExists('educational_needs');
        Schema::dropIfExists('donations');
        Schema::dropIfExists('funds');
        Schema::dropIfExists('donors');
    }
};

