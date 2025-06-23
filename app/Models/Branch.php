<?php

namespace App\Models;

use Ramsey\Uuid\Uuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'region_id',
        'name',
        'code',
        'address',
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

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
