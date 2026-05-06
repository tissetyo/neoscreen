<?php

namespace App\Http\Middleware;

use App\Models\Hotel;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHotelAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $slug = $request->route('slug');

        if (!$user || !$slug) {
            abort(403, 'Unauthorized hotel access.');
        }

        $hotel = Hotel::where('slug', $slug)->firstOrFail();

        if (!$user->isSuperAdmin() && $user->hotel_id !== $hotel->id) {
            abort(403, 'Unauthorized hotel access.');
        }

        $request->attributes->set('hotel', $hotel);

        return $next($request);
    }
}
