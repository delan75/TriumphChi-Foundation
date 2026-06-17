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
            $table->foreignId('school_id')->constrained()->restrictOnDelete();
            $table->foreignId('beneficiary_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('educational_need_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->date('payment_date');
            $table->string('proof_path', 500)->nullable();
            $table->string('status')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('allocation_payment', function (Blueprint $table) {
            $table->foreignId('allocation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->primary(['allocation_id', 'payment_id']);
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

