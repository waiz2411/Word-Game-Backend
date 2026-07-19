<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Synchronize user profile state with database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'userId' => 'required|string',
            'username' => 'required|string',
            'device' => 'nullable|string',
            'country' => 'nullable|string',
            'coins' => 'nullable|integer',
            'levelReached' => 'nullable|integer',
            'adsWatched' => 'nullable|integer',
            'smartlinkClicks' => 'nullable|integer',
            'status' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $userId = $request->input('userId');
        
        $device = $request->input('device') ?? ($this->detectDevice($request->userAgent()));
        $country = $request->input('country') ?? ($request->header('CF-IPCountry') ?? 'US');

        $user = User::updateOrCreate(
            ['id' => $userId],
            [
                'username' => $request->input('username'),
                'device' => $device,
                'country' => $country,
                'coins' => $request->input('coins', 200),
                'level_reached' => $request->input('levelReached', 1),
                'ads_watched' => $request->input('adsWatched', 0),
                'smartlink_clicks' => $request->input('smartlinkClicks', 0),
                'status' => $request->input('status', 'Live'),
            ]
        );

        return response()->json([
            'success' => true,
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
