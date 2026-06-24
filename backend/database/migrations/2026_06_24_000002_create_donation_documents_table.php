<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('donation_id')->constrained()->restrictOnDelete();
            $table->string('document_number')->unique();
            $table->string('type')->index();
            $table->string('status')->default('issued')->index();
            $table->string('locale', 8)->default('en')->index();
            $table->string('title');
            $table->json('snapshot');
            $table->string('path', 500)->nullable();
            $table->timestamp('issued_at')->nullable()->index();
            $table->timestamp('voided_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['donation_id', 'type', 'locale']);
            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_documents');
    }
};
