<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->text('staff_notes')->nullable()->after('user_agent');
            $table->foreignId('handled_by')
                ->nullable()
                ->after('staff_notes')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('responded_at');
            $table->timestamp('archived_at')->nullable()->after('reviewed_at');

            $table->index(['handled_by', 'status']);
            $table->index(['reviewed_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->dropForeign(['handled_by']);
            $table->dropIndex(['handled_by', 'status']);
            $table->dropIndex(['reviewed_at', 'status']);
            $table->dropColumn(['handled_by', 'staff_notes', 'reviewed_at', 'archived_at']);
        });
    }
};
