<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_providers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('method')->index();
            $table->string('category')->index();
            $table->string('status')->default('active')->index();
            $table->json('currencies')->nullable();
            $table->json('config')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['status', 'sort_order']);
        });

        Schema::create('payment_intents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('intent_reference')->unique();
            $table->foreignId('donation_id')->constrained()->restrictOnDelete();
            $table->foreignId('payment_provider_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 14, 2);
            $table->char('currency', 3);
            $table->string('frequency')->default('one_time')->index();
            $table->string('purpose')->default('greatest_need')->index();
            $table->string('status')->default('pending')->index();
            $table->string('provider_intent_id')->nullable()->index();
            $table->string('checkout_url', 1000)->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['donation_id', 'status']);
            $table->index(['payment_provider_id', 'status']);
            $table->index(['currency', 'status']);
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payment_intent_id')->constrained()->restrictOnDelete();
            $table->foreignId('donation_id')->constrained()->restrictOnDelete();
            $table->foreignId('payment_provider_id')->constrained()->restrictOnDelete();
            $table->string('transaction_reference')->unique();
            $table->string('provider_transaction_id')->nullable()->index();
            $table->string('type')->default('payment')->index();
            $table->string('status')->default('pending')->index();
            $table->decimal('amount', 14, 2);
            $table->char('currency', 3);
            $table->timestamp('processed_at')->nullable()->index();
            $table->json('raw_payload')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['payment_intent_id', 'status']);
            $table->index(['donation_id', 'status']);
            $table->index(['payment_provider_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('payment_intents');
        Schema::dropIfExists('payment_providers');
    }
};
