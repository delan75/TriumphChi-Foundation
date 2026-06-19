<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->string('registered_via', 30)->default('local')->after('preferred_locale');
            $table->string('registration_source', 50)->nullable()->after('registered_via');
            $table->timestamp('last_login_at')->nullable()->after('registration_source');

            $table->index('registered_via');
            $table->index('last_login_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['registered_via']);
            $table->dropIndex(['last_login_at']);
            $table->string('password')->nullable(false)->change();
            $table->dropColumn(['registered_via', 'registration_source', 'last_login_at']);
        });
    }
};
