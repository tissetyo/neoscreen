<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promo extends Model
{
    use HasUuids;

    protected $fillable = ['hotel_id', 'title', 'description', 'image_url', 'start_date', 'end_date', 'is_active'];

    protected $appends = ['poster_url', 'valid_from', 'valid_until'];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function getPosterUrlAttribute(): ?string
    {
        return $this->image_url;
    }

    public function getValidFromAttribute(): ?string
    {
        return $this->start_date?->toDateString();
    }

    public function getValidUntilAttribute(): ?string
    {
        return $this->end_date?->toDateString();
    }

    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) return false;
        $now = now();
        if ($this->start_date && $now->lt($this->start_date)) return false;
        if ($this->end_date && $now->gt($this->end_date)) return false;
        return true;
    }
}
