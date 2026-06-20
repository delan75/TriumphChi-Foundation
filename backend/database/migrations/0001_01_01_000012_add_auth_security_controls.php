<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('phone', 50)->nullable()->after('email');
            $table->string('status', 30)->default('active')->after('preferred_locale');

            $table->index('status');
        });

        Schema::table('audit_logs', function (Blueprint $table): void {
            $table->text('user_agent')->nullable()->after('ip_address');
        });

        Schema::create('oauth_login_codes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 30);
            $table->string('code_hash', 128)->unique();
            $table->timestamp('expires_at')->index();
            $table->timestamp('consumed_at')->nullable()->index();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oauth_login_codes');

        Schema::table('audit_logs', function (Blueprint $table): void {
            $table->dropColumn('user_agent');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['status']);
            $table->dropColumn(['phone', 'status']);
        });
    }
};
