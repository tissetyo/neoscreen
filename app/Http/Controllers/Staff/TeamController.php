<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeamController extends Controller
{
    private function getHotel(string $slug): Hotel
    {
        return Hotel::where('slug', $slug)->firstOrFail();
    }

    public function index(string $slug)
    {
        $hotel = $this->getHotel($slug);

        return Inertia::render('Staff/Team', [
            'slug' => $slug,
            'users' => User::where('hotel_id', $hotel->id)
                ->whereIn('role', ['manager', 'frontoffice'])
                ->orderBy('role')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'is_suspended']),
        ]);
    }

    public function store(Request $request, string $slug)
    {
        $hotel = $this->getHotel($slug);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => 'required|string|min:8|max:100',
            'role' => 'required|in:manager,frontoffice',
        ]);

        User::create([
            'hotel_id' => $hotel->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'is_suspended' => false,
        ]);

        return back()->with('success', 'Team member created.');
    }

    public function toggleSuspend(string $slug, string $userId)
    {
        $hotel = $this->getHotel($slug);
        $user = User::where('hotel_id', $hotel->id)
            ->whereIn('role', ['manager', 'frontoffice'])
            ->findOrFail($userId);

        $user->update(['is_suspended' => !$user->is_suspended]);

        return back()->with('success', 'Team member status updated.');
    }
}
