<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class GuideController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Staff/Guide', [
            'context' => 'admin',
            'slug' => null,
            'hotelName' => null,
        ]);
    }
}
