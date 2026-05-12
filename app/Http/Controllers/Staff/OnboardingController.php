<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public static function checklistForHotel(Hotel $hotel): array
    {
        return (new self)->buildChecklist($hotel);
    }

    public static function percentComplete(Hotel $hotel): int
    {
        $list = self::checklistForHotel($hotel);
        $total = count($list);
        if ($total === 0) {
            return 100;
        }

        return (int) round(100 * collect($list)->where('done', true)->count() / $total);
    }

    private function getHotel(string $slug): Hotel
    {
        return Hotel::where('slug', $slug)->firstOrFail();
    }

    public function show(string $slug): Response
    {
        $hotel = $this->getHotel($slug);

        return Inertia::render('Staff/Onboarding', [
            'slug' => $slug,
            'hotel' => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'slug' => $hotel->slug,
            ],
            'checklist' => $this->buildChecklist($hotel),
        ]);
    }

    public function dismiss(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $hotel->onboarding_data ?? [];
        $data['dismissed_at'] = now()->toIso8601String();
        $hotel->update(['onboarding_data' => $data]);

        return back()->with('success', 'Setup checklist dismissed. You can reopen it anytime from the sidebar.');
    }

    public function markStep(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $validated = $request->validate([
            'step' => 'required|string|in:tv_preview,stb_flow,staff_roles,tv_settings_reviewed',
        ]);

        $data = $hotel->onboarding_data ?? [];
        $data['manual'][$validated['step']] = now()->toIso8601String();
        $hotel->update(['onboarding_data' => $data]);

        return back()->with('success', 'Progress saved.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildChecklist(Hotel $hotel): array
    {
        $on = $hotel->onboarding_data ?? [];
        $manual = $on['manual'] ?? [];

        $roomsCount = $hotel->rooms()->count();
        $staffCount = User::where('hotel_id', $hotel->id)
            ->whereIn('role', ['manager', 'frontoffice'])
            ->where('is_suspended', false)
            ->count();

        return [
            [
                'id' => 'rooms',
                'title' => 'Add guest rooms',
                'description' => 'Create room codes so guests can sign in on the TV with PIN.',
                'done' => $roomsCount > 0,
                'href' => "/{$hotel->slug}/frontoffice/rooms",
                'manual' => false,
            ],
            [
                'id' => 'wifi',
                'title' => 'WiFi on the TV',
                'description' => 'Guests see WiFi details on the dashboard — set SSID and password in Settings.',
                'done' => filled($hotel->wifi_ssid),
                'href' => "/{$hotel->slug}/frontoffice/settings",
                'manual' => false,
            ],
            [
                'id' => 'tv_settings_reviewed',
                'title' => 'Review TV & guest-facing settings',
                'description' => 'Screen mode, world clocks, WiFi card, and announcements — confirm in Hotel Settings.',
                'done' => isset($manual['tv_settings_reviewed']),
                'href' => "/{$hotel->slug}/frontoffice/settings",
                'manual' => true,
                'external' => false,
            ],
            [
                'id' => 'staff',
                'title' => 'Staff accounts',
                'description' => 'At least one active manager or front-office login for this hotel (created by your platform administrator).',
                'done' => $staffCount > 0,
                'href' => "/{$hotel->slug}/frontoffice/guide#accounts",
                'manual' => false,
                'external' => false,
            ],
            [
                'id' => 'tv_preview',
                'title' => 'Preview the guest TV',
                'description' => 'Open the TV dashboard preview and confirm branding looks correct.',
                'done' => isset($manual['tv_preview']),
                'href' => "/d/{$hotel->slug}/preview",
                'manual' => true,
                'external' => true,
            ],
            [
                'id' => 'stb_flow',
                'title' => 'Pair a set-top box (STB)',
                'description' => 'Download the STB Launcher from /launcher, install it on a device, then pair the TV code from Front Office.',
                'done' => isset($manual['stb_flow']),
                'href' => "/{$hotel->slug}/frontoffice/stb",
                'manual' => true,
                'external' => false,
            ],
            [
                'id' => 'staff_roles',
                'title' => 'Train team on acknowledgements',
                'description' => 'Service requests, notifications, and alarms support staff and guest acknowledgement — review the Help guide.',
                'done' => isset($manual['staff_roles']),
                'href' => "/{$hotel->slug}/frontoffice/guide#trust",
                'manual' => true,
                'external' => false,
            ],
        ];
    }
}
