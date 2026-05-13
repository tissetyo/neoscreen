<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    private array $configs = [
        'guest-photo' => ['maxSize' => 5120, 'mimes' => 'jpeg,jpg,png,webp', 'directory' => 'guest-photos'],
        'hotel-background' => ['maxSize' => 5120, 'mimes' => 'jpeg,jpg,png,webp', 'directory' => 'hotel-backgrounds'],
        'hotel-featured' => ['maxSize' => 5120, 'mimes' => 'jpeg,jpg,png,webp', 'directory' => 'hotel-featured'],
        'hotel-video' => ['maxSize' => 51200, 'mimes' => 'mp4,webm', 'directory' => 'hotel-videos'],
        'media-image' => ['maxSize' => 5120, 'mimes' => 'jpeg,jpg,png,webp', 'directory' => 'media-images'],
        'media-video' => ['maxSize' => 51200, 'mimes' => 'mp4,webm', 'directory' => 'media-videos'],
        'promo-poster' => ['maxSize' => 5120, 'mimes' => 'jpeg,jpg,png,webp', 'directory' => 'promo-posters'],
        'service-photo' => ['maxSize' => 5120, 'mimes' => 'jpeg,jpg,png,webp', 'directory' => 'service-photos'],
        'tv-app-icon' => ['maxSize' => 2048, 'mimes' => 'jpeg,jpg,png,webp,svg', 'directory' => 'tv-app-icons'],
        'tv-brand-logo' => ['maxSize' => 2048, 'mimes' => 'jpeg,jpg,png,webp,svg', 'directory' => 'tv-brand-logos'],
    ];

    public function store(Request $request, string $type): JsonResponse
    {
        if (!isset($this->configs[$type])) {
            return response()->json(['error' => 'Invalid upload type'], 400);
        }

        $config = $this->configs[$type];
        $request->validate([
            'file' => "required|file|max:{$config['maxSize']}|mimes:{$config['mimes']}",
        ]);

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = "uploads/{$config['directory']}";
        $destination = public_path($path);

        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        $file->move($destination, $filename);
        $storedPath = "{$path}/{$filename}";

        return response()->json([
            'url' => asset($storedPath),
            'path' => $storedPath,
        ]);
    }
}
