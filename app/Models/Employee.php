<?php

namespace App\Models;

use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'region_id',
        'branch_id',
        'department_id',
        'position_id',
        'employee_code',
        'employee_type',
        'employee_status',
        'joined_at',
        'resigned_at',
        'nik',
        'npwp',
        'citizenship',
        'phone_number',
        'photo_path',
        'address',
        'birth_place',
        'birth_date',
        'gender',
        'blood_type',
        'religion',
        'education',
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
     * Get the user associated with the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
