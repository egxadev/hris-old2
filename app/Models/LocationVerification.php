<?php

namespace App\Models;

use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Model;

class LocationVerification extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'employee_id',
        'attendance_id',
        'latitude',
        'longitude',
        'accuracy',
        'altitude',
        'speed',
        'ip_address',
        'user_agent',
        'device_id',
        'network_type',
        'raw_data',
        'verification_results',
        'is_valid',
        'confidence_score',
    ];

    protected $casts = [
        'raw_data' => 'array',
        'verification_results' => 'array',
        'is_valid' => 'boolean',
        'confidence_score' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'accuracy' => 'float',
        'altitude' => 'float',
        'speed' => 'float',
    ];

    public static function booted()
    {
        static::creating(function ($model) {
            $model->id = Uuid::uuid4();
        });
    }

    /**
     * Get the employee associated with this location verification.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the attendance record associated with this location verification.
     */
    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }
}
