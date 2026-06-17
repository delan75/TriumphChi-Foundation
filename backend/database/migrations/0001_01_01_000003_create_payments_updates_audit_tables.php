<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_reference')->unique();
            $table->string('idempotency_key')->nullable()->unique();
            $table->foreignId('fund_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('school_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('beneficiary_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('educational_need_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('payee_type')->default('school')->index();
            $table->string('payee_name')->nullable();
            $table->string('vendor_reference')->nullable();
            $table->decimal('amount', 14, 2);
            $table->char('currency', 3)->default('XAF');
            $table->string('method')->nullable()->index();
            $table->date('payment_date');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('disbursed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('proof_path', 500)->nullable();
            $table->string('status')->index();
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['fund_id', 'status']);
            $table->index(['school_id', 'status']);
            $table->index(['beneficiary_id', 'status']);
            $table->index(['educational_need_id', 'status']);
            $table->index(['status', 'payment_date']);
            $table->index(['payee_type', 'payee_name']);
        });

        Schema::create('allocation_payment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_id')->constrained()->restrictOnDelete();
            $table->foreignId('payment_id')->constrained()->restrictOnDelete();
            $table->decimal('amount_applied', 14, 2);
            $table->timestamps();

            $table->unique(['allocation_id', 'payment_id']);
            $table->index(['payment_id', 'allocation_id']);
        });

        Schema::create('impact_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beneficiary_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('visibility')->default('private')->index();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->string('action')->index();
            $table->json('before_values')->nullable();
            $table->json('after_values')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['auditable_type', 'auditable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('impact_updates');
        Schema::dropIfExists('allocation_payment');
        Schema::dropIfExists('payments');
    }
};
