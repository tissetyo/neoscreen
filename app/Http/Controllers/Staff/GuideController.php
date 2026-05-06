<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Inertia\Inertia;
use Inertia\Response;

class GuideController extends Controller
{
    public function frontOffice(string $slug): Response
    {
        $hotel = Hotel::where('slug', $slug)->firstOrFail();

        return Inertia::render('Staff/Guide', [
            'context' => 'frontoffice',
            'slug' => $slug,
            'hotelName' => $hotel->name,
        ]);
    }
}
