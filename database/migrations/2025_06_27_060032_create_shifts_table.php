<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('grace_period_in')->default(0)->comment('Toleransi keterlambatan check-in dalam menit');
            $table->integer('grace_period_out')->default(0)->comment('Toleransi pulang cepat check-out dalam menit');
            $table->boolean('is_night_shift')->default(false)->comment('True jika shift melewati tengah malam');

            // Timestamps and user tracking
            $table->timestamp('created_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->uuid('deleted_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
