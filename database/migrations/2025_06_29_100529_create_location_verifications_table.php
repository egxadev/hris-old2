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
        Schema::create('location_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employee_id');
            $table->uuid('attendance_id')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('accuracy', 10, 2)->nullable();
            $table->decimal('altitude', 10, 2)->nullable();
            $table->decimal('speed', 10, 2)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('device_id')->nullable();
            $table->string('network_type')->nullable();
            $table->json('raw_data')->nullable();
            $table->json('verification_results')->nullable();
            $table->boolean('is_valid')->default(true);
            $table->integer('confidence_score')->default(100);
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->foreign('attendance_id')->references('id')->on('attendances')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_verifications');
    }
};
