<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IptvChannelOverride extends Model
{
    protected $fillable = [
        'country_code',
        'channel_key',
        'name',
        'source_url',
        'restream_url',
        'is_available',
        'consecutive_failures',
        'response_time_ms',
        'status_message',
        'checked_at',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'checked_at' => 'datetime',
    ];
}
