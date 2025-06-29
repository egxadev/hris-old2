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
        Schema::create('attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employee_id');
            $table->date('date');

            $table->time('check_in_time')->nullable();
            $table->string('check_in_location')->nullable()->comment('Lokasi check-in jika relevan (misal: GPS koordinat, IP address)');
            $table->longText('check_in_photo')->nullable();

            $table->time('check_out_time')->nullable();
            $table->string('check_out_location')->nullable()->comment('Lokasi check-out jika relevan');
            $table->longText('check_out_photo')->nullable();

            // Status absensi ini bisa dihitung berdasarkan jadwal shift atau diinput manual (misal: "sakit", "cuti")
            $table->enum('status', ['present', 'absent', 'late', 'early_out', 'on_leave', 'sick', 'overtime', 'no_check_out'])->default('present');
            $table->text('notes')->nullable();                                                 // Catatan tambahan (misal: alasan telat)

            // Optional: Jika ingin menyimpan durasi kerja langsung di tabel ini
            $table->integer('worked_minutes')->nullable()->comment('Total menit kerja yang dihitung');

            // Optional: Jika ingin mencatat shift yang berlaku pada hari absensi ini (bisa diambil dari schedules.shift_id)
            // $table->foreignId('shift_id')->nullable()->constrained('shifts')->onDelete('set null');

            // Unique constraint: Memastikan satu karyawan hanya memiliki satu record absensi per hari
            $table->unique(['employee_id', 'date']);

            // Foreign key
            $table->foreign('employee_id')->references('id')->on('employees')->onUpdate('cascade')->onDelete('restrict');

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
        Schema::dropIfExists('attendances');
    }
};
