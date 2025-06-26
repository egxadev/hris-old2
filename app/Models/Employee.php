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

    protected $casts = [
        'joined_at' => 'date',
        'resigned_at' => 'date',
        'birth_date' => 'date',
        'employee_type' => 'integer',
        'employee_status' => 'integer',
        'gender' => 'integer',
        'religion' => 'integer',
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

    /**
     * Get the region associated with the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the branch associated with the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the department associated with the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the position associated with the employee.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function position()
    {
        return $this->belongsTo(Position::class);
    }
}
