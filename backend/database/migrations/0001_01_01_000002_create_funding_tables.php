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
            $table->string('status')->default('active')->index();
            $table->json('communication_preferences')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['type', 'status']);
        });

        Schema::create('funds', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->char('currency', 3)->default('XAF');
            $table->string('restriction_type')->default('unrestricted')->index();
            $table->string('restricted_to_type')->nullable();
            $table->unsignedBigInteger('restricted_to_id')->nullable();
            $table->string('status')->default('active')->index();
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['restricted_to_type', 'restricted_to_id']);
            $table->index(['status', 'restriction_type']);
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('idempotency_key')->nullable()->unique();
            $table->foreignId('donor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fund_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 14, 2);
            $table->char('currency', 3)->default('XAF');
            $table->string('method')->index();
            $table->string('provider')->nullable()->index();
            $table->string('provider_reference')->nullable();
            $table->string('status')->default('pending')->index();
            $table->timestamp('donated_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->string('receipt_path', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['provider', 'provider_reference']);
            $table->index(['donor_id', 'status']);
            $table->index(['fund_id', 'status']);
            $table->index(['status', 'donated_at']);
        });

        Schema::create('allocations', function (Blueprint $table) {
            $table->id();
            $table->string('allocation_reference')->unique();
            $table->foreignId('donation_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('fund_id')->constrained()->restrictOnDelete();
            $table->foreignId('educational_need_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 14, 2);
            $table->char('currency', 3)->default('XAF');
            $table->string('status')->default('proposed')->index();
            $table->timestamp('allocated_at')->nullable();
            $table->text('reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['donation_id', 'status']);
            $table->index(['fund_id', 'status']);
            $table->index(['educational_need_id', 'status']);
            $table->index(['status', 'allocated_at']);
        });

        Schema::create('sponsorships', function (Blueprint $table) {
            $table->id();
            $table->string('sponsorship_reference')->unique();
            $table->foreignId('donor_id')->constrained()->restrictOnDelete();
            $table->foreignId('beneficiary_id')->constrained()->restrictOnDelete();
            $table->foreignId('fund_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('type')->index();
            $table->decimal('pledged_amount', 14, 2);
            $table->char('currency', 3)->default('XAF');
            $table->string('billing_frequency')->nullable()->index();
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->string('status')->index();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['donor_id', 'status']);
            $table->index(['beneficiary_id', 'status']);
            $table->index(['status', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsorships');
        Schema::dropIfExists('allocations');
        Schema::dropIfExists('donations');
        Schema::dropIfExists('funds');
        Schema::dropIfExists('donors');
    }
};
