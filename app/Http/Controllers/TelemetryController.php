<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TelemetryEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TelemetryController extends Controller
{
    /**
     * Log a telemetry event and update user aggregates.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logEvent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'userId' => 'required|string',
            'type' => 'required|string',
            'details' => 'nullable|array', // accepts a structured details object
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $userId = $request->input('userId');
        $type = $request->input('type');
        $details = $request->input('details', []);

        // Find or create User stub if they haven't synced yet
        $user = User::firstOrCreate(
            ['id' => $userId],
            [
                'username' => 'Guest_' . substr($userId, -4),
                'device' => $this->detectDevice($request->userAgent()),
                'country' => $request->header('CF-IPCountry') ?? 'US',
                'coins' => 200,
                'level_reached' => 1,
            ]
        );

        // Perform aggregate logic updates based on event type
        switch ($type) {
            case 'ad_watch_banner':
            case 'ad_watch_interstitial':
            case 'ad_watch_rewarded':
                $user->increment('ads_watched');
                break;
            case 'smartlink_click':
                $user->increment('smartlink_clicks');
                break;
            case 'coin_spend':
                if (isset($details['cost'])) {
                    $user->decrement('coins', intval($details['cost']));
                }
                break;
            case 'daily_claim':
            case 'ad_watch_rewarded_grant':
                if (isset($details['coins'])) {
                    $user->increment('coins', intval($details['coins']));
                }
                break;
            case 'level_complete':
                if (isset($details['level'])) {
                    $user->level_reached = max($user->level_reached, intval($details['level']) + 1);
                }
                // Standard reward is +25 coins
                $user->increment('coins', 25);
                break;
        }

        // Save last active timestamp
        $user->last_active = now();
        $user->status = 'Live';
        $user->save();

        // Create the event log
        $event = TelemetryEvent::create([
            'user_id' => $userId,
            'type' => $type,
            'details' => json_encode($details),
        ]);

        return response()->json([
            'success' => true,
            'event' => $event,
            'user' => $user
        ]);
    }

    /**
     * Helper to detect device from user-agent headers.
     */
    private function detectDevice($userAgent)
    {
        if (preg_match('/Mobi|Android|iPhone|iPad/i', $userAgent)) {
            return 'Mobile';
        }
        return 'Desktop';
    }
}
