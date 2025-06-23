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
        Schema::create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('region_id');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('address');

            // Timestamps and user tracking
            $table->timestamp('created_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->uuid('deleted_by')->nullable();

            // foreign key
            $table->foreign('region_id')->references('id')->on('regions')->onUpdate('cascade')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
