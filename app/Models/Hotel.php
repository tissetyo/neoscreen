<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'slug', 'location', 'timezone',
        'wifi_ssid', 'wifi_password', 'wifi_username',
        'default_background_url', 'featured_image_url', 'startup_video_url',
        'airport_iata_code', 'latitude', 'longitude',
        'clock_timezone_1', 'clock_timezone_2', 'clock_timezone_3',
        'clock_label_1', 'clock_label_2', 'clock_label_3',
        'tv_layout_config', 'is_active', 'onboarding_data',
        'billing_plan', 'billing_cycle', 'billing_unit', 'billing_currency',
        'billing_base_price', 'billing_room_price', 'billing_stb_price',
        'payment_status', 'next_billing_date',
    ];

    protected $casts = [
        'tv_layout_config' => 'array',
        'onboarding_data' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'billing_base_price' => 'decimal:2',
        'billing_room_price' => 'decimal:2',
        'billing_stb_price' => 'decimal:2',
        'next_billing_date' => 'date',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class);
    }

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class);
    }

    public function promos(): HasMany
    {
        return $this->hasMany(Promo::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(HotelMedia::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the screen mode from tv_layout_config
     */
    public function getScreenModeAttribute(): string
    {
        return $this->tv_layout_config['screenMode'] ?? 'grid';
    }

    /**
     * Get slideshow config
     */
    public function getSlideshowConfigAttribute(): array
    {
        return $this->tv_layout_config['slideshow'] ?? [
            'autoAdvanceSeconds' => 10,
            'widgetDismissSeconds' => 10,
            'transition' => 'crossfade',
            'images' => [],
            'showFloatingClock' => true,
        ];
    }
}
