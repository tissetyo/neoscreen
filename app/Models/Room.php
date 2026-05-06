<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasUuids;

    protected $fillable = [
        'hotel_id', 'room_code', 'pin', 'room_session_token', 'stb_device_id',
        'stb_status', 'stb_paired_at', 'stb_last_seen_at', 'room_type_id',
        'guest_name', 'guest_photo_url', 'background_url',
        'checkin_date', 'checkout_date', 'custom_welcome_message', 'is_occupied',
    ];

    protected $casts = [
        'is_occupied' => 'boolean',
        'checkin_date' => 'date',
        'checkout_date' => 'date',
        'stb_paired_at' => 'datetime',
        'stb_last_seen_at' => 'datetime',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class)->orderBy('created_at', 'asc');
    }

    public function alarms(): HasMany
    {
        return $this->hasMany(Alarm::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function mobileSessions(): HasMany
    {
        return $this->hasMany(MobileSession::class);
    }

    /**
     * Check if today is checkout day
     */
    public function getIsCheckoutDayAttribute(): bool
    {
        if (!$this->checkout_date) return false;
        return $this->checkout_date->isToday();
    }
}
