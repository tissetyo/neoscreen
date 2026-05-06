<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Alarm;
use App\Models\ChatMessage;
use App\Models\Hotel;
use App\Models\Notification;
use App\Models\Room;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FrontOfficeController extends Controller
{
    private function getHotel(string $slug): Hotel
    {
        return Hotel::where('slug', $slug)->firstOrFail();
    }

    public function home(string $slug)
    {
        $hotel = $this->getHotel($slug);

        $rooms = Room::where('hotel_id', $hotel->id)->get();
        $totalRooms = $rooms->count();
        $occupiedRooms = $rooms->where('is_occupied', true)->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100) : 0;

        $unreadChats = ChatMessage::whereHas('room', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->where('sender', 'guest')->where('is_read', false)->count();

        $activeAlarms = Alarm::whereHas('room', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->where('is_active', true)->count();

        $pendingRequests = ServiceRequest::where('hotel_id', $hotel->id)
            ->where('status', 'pending')
            ->count();

        $onboarding = $hotel->onboarding_data ?? [];
        $dismissed = isset($onboarding['dismissed_at']);

        return Inertia::render('Staff/Home', [
            'slug' => $slug,
            'totalRooms' => $totalRooms,
            'occupiedRooms' => $occupiedRooms,
            'occupancyRate' => $occupancyRate,
            'unreadChats' => $unreadChats,
            'activeAlarms' => $activeAlarms,
            'pendingRequests' => $pendingRequests,
            'onboardingBanner' => [
                'dismissed' => $dismissed,
                'percentComplete' => OnboardingController::percentComplete($hotel),
            ],
        ]);
    }

    public function rooms(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $rooms = Room::with('roomType')
            ->where('hotel_id', $hotel->id)
            ->orderBy('room_code')
            ->get();

        return Inertia::render('Staff/Rooms', [
            'slug' => $slug,
            'rooms' => $rooms,
        ]);
    }

    public function updateRoom(Request $request, string $slug, string $roomId)
    {
        $hotel = $this->getHotel($slug);
        $room = Room::where('hotel_id', $hotel->id)->findOrFail($roomId);

        $data = $request->validate([
            'guest_name' => 'nullable|string|max:255',
            'custom_welcome_message' => 'nullable|string|max:500',
            'checkin_date' => 'nullable|date',
            'checkout_date' => 'nullable|date',
            'pin' => 'nullable|string|max:10',
            'is_occupied' => 'boolean',
        ]);

        $room->update($data);

        return back()->with('success', 'Room updated successfully.');
    }

    public function storeRoom(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'room_code' => ['required', 'string', 'max:50', Rule::unique('rooms', 'room_code')->where('hotel_id', $hotel->id)],
            'pin' => 'required|string|min:4|max:10',
        ]);

        Room::create([
            'hotel_id' => $hotel->id,
            'room_code' => $data['room_code'],
            'pin' => $data['pin'],
            'is_occupied' => false,
        ]);

        return back()->with('success', 'Room created successfully.');
    }

    public function deleteRoom(string $slug, string $roomId)
    {
        $hotel = $this->getHotel($slug);
        Room::where('hotel_id', $hotel->id)->findOrFail($roomId)->delete();

        return back()->with('success', 'Room deleted successfully.');
    }

    public function chat(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $rooms = Room::where('hotel_id', $hotel->id)
            ->orderBy('room_code')
            ->get(['id', 'room_code', 'guest_name']);

        return Inertia::render('Staff/Chat', [
            'slug' => $slug,
            'rooms' => $rooms,
        ]);
    }

    public function getChatMessages(string $slug, string $roomId)
    {
        $hotel = $this->getHotel($slug);
        $room = Room::where('hotel_id', $hotel->id)->findOrFail($roomId);

        $messages = $room->chatMessages()->orderBy('created_at')->limit(100)->get();

        $room->chatMessages()
            ->where('sender', 'guest')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    public function sendChatMessage(Request $request, string $slug, string $roomId)
    {
        $hotel = $this->getHotel($slug);
        $room = Room::where('hotel_id', $hotel->id)->findOrFail($roomId);
        $data = $request->validate(['message' => 'required|string|max:1000']);

        $message = ChatMessage::create([
            'room_id' => $room->id,
            'sender' => 'staff',
            'message' => $data['message'],
            'is_read' => false,
        ]);

        return response()->json($message);
    }

    public function notifications(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $notifications = Notification::where('hotel_id', $hotel->id)
            ->with(['staffAcknowledger:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $rooms = Room::where('hotel_id', $hotel->id)
            ->orderBy('room_code')
            ->get(['id', 'room_code']);

        return Inertia::render('Staff/Notifications', [
            'slug' => $slug,
            'notifications' => $notifications,
            'rooms' => $rooms,
        ]);
    }

    public function sendNotification(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'title' => 'required|string|max:100',
            'body' => 'nullable|string|max:500',
            'message' => 'nullable|string|max:500',
            'room_id' => 'nullable|exists:rooms,id',
        ]);

        Notification::create([
            'hotel_id' => $hotel->id,
            'room_id' => $data['room_id'] ?? null,
            'title' => $data['title'],
            'message' => $data['body'] ?? $data['message'] ?? '',
        ]);

        return back()->with('success', 'Notification sent.');
    }

    public function acknowledgeNotification(string $slug, string $notifId)
    {
        $hotel = $this->getHotel($slug);
        $n = Notification::where('hotel_id', $hotel->id)->findOrFail($notifId);
        $n->update([
            'staff_acknowledged_at' => now(),
            'staff_acknowledged_by' => Auth::id(),
        ]);

        return back()->with('success', 'Notification logged as reviewed by staff.');
    }

    public function deleteNotification(string $slug, string $notifId)
    {
        $hotel = $this->getHotel($slug);
        Notification::where('hotel_id', $hotel->id)->findOrFail($notifId)->delete();

        return back()->with('success', 'Notification deleted.');
    }

    public function alarms(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $alarms = Alarm::whereHas('room', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })
            ->with(['acknowledger:id,name'])
            ->orderBy('alarm_time')
            ->get();

        $rooms = Room::where('hotel_id', $hotel->id)
            ->get(['id', 'room_code', 'guest_name']);

        return Inertia::render('Staff/Alarms', [
            'slug' => $slug,
            'alarms' => $alarms,
            'rooms' => $rooms,
        ]);
    }

    public function acknowledgeAlarm(string $slug, string $alarmId)
    {
        $hotel = $this->getHotel($slug);
        $alarm = Alarm::whereHas('room', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->findOrFail($alarmId);

        $alarm->update([
            'is_active' => false,
            'acknowledged_at' => now(),
            'acknowledged_by' => Auth::id(),
        ]);

        return back()->with('success', 'Alarm acknowledged.');
    }

    public function serviceRequests(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $requests = ServiceRequest::with(['service', 'room', 'staffAcknowledger:id,name'])
            ->where('hotel_id', $hotel->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Staff/ServiceRequests', [
            'slug' => $slug,
            'requests' => $requests,
        ]);
    }

    public function acknowledgeServiceRequest(string $slug, string $requestId)
    {
        $hotel = $this->getHotel($slug);
        $req = ServiceRequest::where('hotel_id', $hotel->id)->findOrFail($requestId);

        $req->update([
            'staff_acknowledged_at' => now(),
            'staff_acknowledged_by' => Auth::id(),
        ]);

        return back()->with('success', 'Request acknowledged — guests see faster response times when staff confirms receipt.');
    }

    public function updateServiceRequest(Request $request, string $slug, string $requestId)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $req = ServiceRequest::where('hotel_id', $hotel->id)->findOrFail($requestId);

        $updates = ['status' => $data['status']];
        if (! $req->staff_acknowledged_at && $data['status'] !== 'pending') {
            $updates['staff_acknowledged_at'] = now();
            $updates['staff_acknowledged_by'] = Auth::id();
        }

        $req->update($updates);

        return back()->with('success', 'Status updated.');
    }

    public function promos(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $promos = \App\Models\Promo::where('hotel_id', $hotel->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Staff/Promos', [
            'slug' => $slug,
            'promos' => $promos,
        ]);
    }

    public function storePromo(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        \App\Models\Promo::create(array_merge($data, ['hotel_id' => $hotel->id, 'is_active' => true]));

        return back()->with('success', 'Promo created.');
    }

    public function togglePromo(string $slug, string $promoId)
    {
        $hotel = $this->getHotel($slug);
        $promo = \App\Models\Promo::where('hotel_id', $hotel->id)->findOrFail($promoId);
        $promo->update(['is_active' => ! $promo->is_active]);

        return back()->with('success', 'Promo updated.');
    }

    public function deletePromo(string $slug, string $promoId)
    {
        $hotel = $this->getHotel($slug);
        \App\Models\Promo::where('hotel_id', $hotel->id)->findOrFail($promoId)->delete();

        return back()->with('success', 'Promo deleted.');
    }

    public function analytics(string $slug)
    {
        $hotel = $this->getHotel($slug);
        $insights = $this->buildAnalyticsInsights($hotel);

        return Inertia::render('Staff/Analytics', array_merge([
            'slug' => $slug,
        ], $insights));
    }

    /**
     * @return array<string, mixed>
     */
    private function buildAnalyticsInsights(Hotel $hotel): array
    {
        $rooms = Room::where('hotel_id', $hotel->id)->get();
        $totalRooms = $rooms->count();
        $occupiedRooms = $rooms->where('is_occupied', true)->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100) : 0;

        $unreadChats = ChatMessage::whereHas('room', function ($q) use ($hotel) {
            $q->where('hotel_id', $hotel->id);
        })->where('sender', 'guest')->where('is_read', false)->count();

        $pendingRequests = ServiceRequest::where('hotel_id', $hotel->id)
            ->where('status', 'pending')->count();

        $totalPromos = \App\Models\Promo::where('hotel_id', $hotel->id)->where('is_active', true)->count();
        $totalServices = \App\Models\Service::where('hotel_id', $hotel->id)->count();

        $days = 14;
        $start = now()->subDays($days)->startOfDay();

        $roomIds = $rooms->pluck('id');

        $serviceRequestsSeries = $this->dailyCounts(
            ServiceRequest::where('hotel_id', $hotel->id)->where('created_at', '>=', $start),
            $days,
            'created_at'
        );

        $chatGuestSeries = $this->dailyCounts(
            ChatMessage::whereIn('room_id', $roomIds)->where('sender', 'guest')->where('created_at', '>=', $start),
            $days,
            'created_at'
        );

        $chatStaffSeries = $this->dailyCounts(
            ChatMessage::whereIn('room_id', $roomIds)->where('sender', 'staff')->where('created_at', '>=', $start),
            $days,
            'created_at'
        );

        $notificationsSent = $this->dailyCounts(
            Notification::where('hotel_id', $hotel->id)->where('created_at', '>=', $start),
            $days,
            'created_at'
        );

        $notificationsRead = $this->dailyCounts(
            Notification::where('hotel_id', $hotel->id)->where('is_read', true)->where('created_at', '>=', $start),
            $days,
            'created_at'
        );

        $topServices = ServiceRequest::where('hotel_id', $hotel->id)
            ->whereNotNull('service_id')
            ->where('created_at', '>=', $start)
            ->with('service:id,name')
            ->get()
            ->groupBy('service_id')
            ->map(fn ($g) => ['name' => $g->first()->service?->name ?? 'Unknown', 'count' => $g->count()])
            ->sortByDesc('count')
            ->values()
            ->take(6)
            ->all();

        $statusBreakdown = ServiceRequest::where('hotel_id', $hotel->id)
            ->selectRaw('status, count(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status')
            ->all();

        $acked = ServiceRequest::where('hotel_id', $hotel->id)
            ->whereNotNull('staff_acknowledged_at')
            ->where('created_at', '>=', $start)
            ->get(['created_at', 'staff_acknowledged_at']);

        $avgMinutesToAck = null;
        if ($acked->isNotEmpty()) {
            $totalMin = $acked->sum(fn ($r) => $r->staff_acknowledged_at->diffInMinutes($r->created_at));
            $avgMinutesToAck = (int) round($totalMin / $acked->count());
        }

        $pendingNoStaffAck = ServiceRequest::where('hotel_id', $hotel->id)
            ->where('status', 'pending')
            ->whereNull('staff_acknowledged_at')
            ->count();

        $guestAckRate = ServiceRequest::where('hotel_id', $hotel->id)
            ->where('status', 'completed')
            ->count();

        $guestAcked = ServiceRequest::where('hotel_id', $hotel->id)
            ->where('status', 'completed')
            ->whereNotNull('guest_acknowledged_at')
            ->count();

        $guestAckPercent = $guestAckRate > 0 ? (int) round(100 * $guestAcked / $guestAckRate) : 0;

        $alarmsAck7d = Alarm::whereHas('room', fn ($q) => $q->where('hotel_id', $hotel->id))
            ->whereNotNull('acknowledged_at')
            ->where('acknowledged_at', '>=', now()->subDays(7))
            ->count();

        $alarmsActive = Alarm::whereHas('room', fn ($q) => $q->where('hotel_id', $hotel->id))
            ->where('is_active', true)
            ->count();

        $notificationsPendingStaffAck = Notification::where('hotel_id', $hotel->id)
            ->whereNull('staff_acknowledged_at')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return [
            'totalRooms' => $totalRooms,
            'occupiedRooms' => $occupiedRooms,
            'occupancyRate' => $occupancyRate,
            'unreadChats' => $unreadChats,
            'pendingRequests' => $pendingRequests,
            'totalPromos' => $totalPromos,
            'totalServices' => $totalServices,
            'serviceRequestsByDay' => $serviceRequestsSeries,
            'chatGuestByDay' => $chatGuestSeries,
            'chatStaffByDay' => $chatStaffSeries,
            'notificationsSentByDay' => $notificationsSent,
            'notificationsReadByDay' => $notificationsRead,
            'topServices' => $topServices,
            'requestStatusBreakdown' => $statusBreakdown,
            'avgMinutesToStaffAck' => $avgMinutesToAck,
            'pendingRequestsWithoutStaffAck' => $pendingNoStaffAck,
            'guestAcknowledgementPercent' => $guestAckPercent,
            'alarmsAcknowledged7d' => $alarmsAck7d,
            'alarmsActive' => $alarmsActive,
            'notificationsPendingStaffAck7d' => $notificationsPendingStaffAck,
        ];
    }

    /**
     * @return array<int, array{date: string, count: int}>
     */
    private function dailyCounts($query, int $days, string $column): array
    {
        $rows = $query->get([$column]);
        $bucket = [];
        foreach ($rows as $row) {
            $d = $row->{$column}->format('Y-m-d');
            $bucket[$d] = ($bucket[$d] ?? 0) + 1;
        }

        $series = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $d = now()->subDays($i)->format('Y-m-d');
            $series[] = ['date' => $d, 'count' => $bucket[$d] ?? 0];
        }

        return $series;
    }
}
