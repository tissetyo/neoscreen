<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StbPairingCode extends Model
{
    use HasUuids;

    protected $fillable = ['code', 'hotel_id', 'hotel_slug', 'room_code', 'is_paired', 'expires_at'];

    protected $casts = [
        'is_paired' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
