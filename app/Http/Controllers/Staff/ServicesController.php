<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceOption;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    private function getHotel(string $slug): Hotel
    {
        return Hotel::where('slug', $slug)->firstOrFail();
    }

    public function index(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $services = Service::with('options')
            ->where('hotel_id', $hotel->id)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Staff/Services', [
            'slug' => $slug,
            'services' => $services,
        ]);
    }

    public function store(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'color_theme' => 'nullable|string|max:30',
            'description' => 'nullable|string|max:1000',
            'image_url' => 'nullable|string|max:2048',
        ]);

        $sort = Service::where('hotel_id', $hotel->id)->max('sort_order') + 1;
        Service::create(array_merge($data, ['hotel_id' => $hotel->id, 'is_active' => true, 'sort_order' => $sort]));

        return back()->with('success', 'Service category created.');
    }

    public function update(Request $request, string $slug, string $serviceId)
    {
        $hotel = $this->getHotel($slug);
        $service = Service::where('hotel_id', $hotel->id)->findOrFail($serviceId);

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'color_theme' => 'nullable|string|max:30',
            'description' => 'nullable|string|max:1000',
            'image_url' => 'nullable|string|max:2048',
            'is_active' => 'required|boolean',
        ]);

        $service->update($data);

        return back()->with('success', 'Service category updated.');
    }

    public function destroy(string $slug, string $serviceId)
    {
        $hotel = $this->getHotel($slug);
        $service = Service::where('hotel_id', $hotel->id)->findOrFail($serviceId);
        $service->options()->delete();
        $service->delete();

        return back()->with('success', 'Service category deleted.');
    }

    public function storeOption(Request $request, string $slug, string $serviceId)
    {
        $hotel = $this->getHotel($slug);
        $service = Service::where('hotel_id', $hotel->id)->findOrFail($serviceId);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
        ]);

        ServiceOption::create(array_merge($data, ['service_id' => $service->id]));

        return back()->with('success', 'Package added.');
    }

    public function destroyOption(string $slug, string $serviceId, string $optionId)
    {
        $hotel = $this->getHotel($slug);
        $service = Service::where('hotel_id', $hotel->id)->findOrFail($serviceId);
        ServiceOption::where('service_id', $service->id)->findOrFail($optionId)->delete();

        return back()->with('success', 'Package deleted.');
    }
}
