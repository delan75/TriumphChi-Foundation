<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('reason', 40);
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('locale', 5)->default('en');
            $table->string('status', 40)->default('new');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index(['reason', 'created_at']);
            $table->index('email');
        });

        Schema::create('contact_message_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contact_message_id')
                ->constrained()
                ->restrictOnDelete();
            $table->string('original_name');
            $table->string('stored_name');
            $table->string('path');
            $table->string('disk')->default('local');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes');
            $table->string('scan_status', 40)->default('passed');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['contact_message_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_message_attachments');
        Schema::dropIfExists('contact_messages');
    }
};
