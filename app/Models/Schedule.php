<?php

namespace App\Models;

use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'shift_id',
        'employee_id',
        'date',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    public static function booted()
    {
        static::creating(function ($model) {
            $model->id = Uuid::uuid4();
        });
    }

    /**
     * Get the employee that owns the schedule.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the shift that owns the schedule.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }
}
