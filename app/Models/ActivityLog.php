<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasUuids;

    protected $fillable = ['hotel_id', 'user_id', 'action', 'details'];

    protected $casts = ['details' => 'array'];
}
