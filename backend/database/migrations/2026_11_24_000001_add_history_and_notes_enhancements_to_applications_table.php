<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->text('public_comment')->nullable()->after('verification_notes');
        });

        Schema::table('application_status_history', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->after('notes');
        });

        Schema::create('application_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('stage')->nullable();
            $table->text('note');
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index(['application_id', 'created_at']);
            $table->index(['application_id', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_notes');

        Schema::table('application_status_history', function (Blueprint $table) {
            $table->dropColumn('is_public');
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn('public_comment');
        });
    }
};
