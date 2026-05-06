<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MobileSession extends Model
{
    use HasUuids;

    protected $fillable = ['room_id', 'session_id', 'guest_name', 'expires_at'];

    protected $casts = ['expires_at' => 'datetime'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
