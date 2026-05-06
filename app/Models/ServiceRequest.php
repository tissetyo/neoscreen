<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    use HasUuids;

    protected $fillable = [
        'room_id', 'service_id', 'hotel_id', 'items', 'notes', 'status', 'total_price',
        'staff_acknowledged_at', 'staff_acknowledged_by', 'guest_acknowledged_at',
    ];

    protected $casts = [
        'items' => 'array',
        'total_price' => 'decimal:2',
        'staff_acknowledged_at' => 'datetime',
        'guest_acknowledged_at' => 'datetime',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function staffAcknowledger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_acknowledged_by');
    }
}
