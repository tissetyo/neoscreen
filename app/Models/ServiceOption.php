<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceOption extends Model
{
    use HasUuids;

    protected $fillable = ['service_id', 'name', 'price'];

    protected $casts = ['price' => 'decimal:2'];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
