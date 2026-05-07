<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelMedia extends Model
{
    use HasUuids;

    protected $table = 'hotel_media';

    protected $fillable = [
        'hotel_id', 'title', 'type', 'url', 'source_type',
        'room_ids', 'tags', 'is_slideshow', 'sort_order',
    ];

    protected $casts = [
        'room_ids' => 'array',
        'tags' => 'array',
        'is_slideshow' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function appliesToRoom(string $roomId): bool
    {
        $roomIds = $this->room_ids ?? [];
        return count($roomIds) === 0 || in_array($roomId, $roomIds, true);
    }
}
