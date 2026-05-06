<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasUuids;

    protected $fillable = [
        'hotel_id', 'room_id', 'title', 'message', 'type', 'is_read',
        'staff_acknowledged_at', 'staff_acknowledged_by',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'staff_acknowledged_at' => 'datetime',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function staffAcknowledger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_acknowledged_by');
    }
}
