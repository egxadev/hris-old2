<?php

namespace App\Models;

use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shift extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'grace_period_in',
        'grace_period_out',
        'is_night_shift',
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
}
