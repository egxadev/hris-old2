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
        Schema::create('employees', function (Blueprint $table) {
            // Primary and foreign keys
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('region_id');
            $table->uuid('branch_id');
            $table->uuid('department_id');
            $table->uuid('position_id');

            // Employee identification
            $table->string('employee_code')->unique();
            $table->tinyInteger('employee_type')->comment('0 = Permanent, 1 = Contract, 2 = Freelance, 3 = Internship');
            $table->tinyInteger('employee_status')->default(0)->comment('1 = Active, 0 = Non Active');
            $table->date('joined_at');
            $table->date('resigned_at')->nullable();

            // Personal information
            $table->string('nik')->unique();
            $table->string('npwp')->nullable();
            $table->string('citizenship');
            $table->string('phone_number');
            $table->string('photo_path')->nullable();
            $table->text('address');
            $table->string('birth_place');
            $table->date('birth_date');
            $table->tinyInteger('gender')->comment('0 = Female, 1 = Male');
            $table->string('blood_type', 3)->nullable();
            $table->tinyInteger('religion')->comment('0 = Islam, 1 = Kristen, 2 = Katolik, 3 = Hindu, 4 = Buddha, 5 = Konghucu');
            $table->string('education');

            // Timestamps and user tracking
            $table->timestamp('created_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->uuid('deleted_by')->nullable();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('restrict');
            $table->foreign('region_id')->references('id')->on('regions')->onUpdate('cascade')->onDelete('restrict');
            $table->foreign('branch_id')->references('id')->on('branches')->onUpdate('cascade')->onDelete('restrict');
            $table->foreign('department_id')->references('id')->on('departments')->onUpdate('cascade')->onDelete('restrict');
            $table->foreign('position_id')->references('id')->on('positions')->onUpdate('cascade')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
