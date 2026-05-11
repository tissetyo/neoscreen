<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IptvCountry extends Model
{
    protected $primaryKey = 'code';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'code',
        'name',
        'region',
        'playlist_url',
        'is_enabled',
        'sort_order',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];
}
