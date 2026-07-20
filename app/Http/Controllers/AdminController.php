<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TelemetryEvent;
use App\Models\CpmRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Enforce admin password protection.
     */
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $expectedPassword = env('ADMIN_PASSWORD', 'WordGameMasterAdmin2026!');
            $providedPassword = $request->header('X-Admin-Password') ?? $request->input('admin_password');

            if ($providedPassword !== $expectedPassword) {
                return response()->json(['error' => 'Unauthorized. Invalid admin password.'], 401);
            }

            return $next($request);
        });
    }

    /**
     * Get aggregated telemetry statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function stats()
    {
        $totalUsers = User::count();
        
        $newUsersToday = User::whereDate('created_at', today())->count();
        
        $totalAds = User::sum('ads_watched');
        $totalSmartlinks = User::sum('smartlink_clicks');
        $totalCoins = User::sum('coins');
        
        // Sum completed levels (assume completed levels is level_reached - 1)
        $levelsCompleted = User::selectRaw('SUM(level_reached - 1) as total')->value('total') ?? 0;
        
        // Fetch CPM rates from database
        $rates = CpmRate::pluck('rate', 'ad_type')->all();
        $bannerRate = $rates['banner'] ?? 0.005;
        $interstitialRate = $rates['interstitial'] ?? 0.04;
        $rewardedRate = $rates['rewarded'] ?? 0.07;
        $smartlinkRate = $rates['smartlink'] ?? 0.18;

        // Count event views for precise CPM math
        $bannerCount = TelemetryEvent::where('type', 'ad_watch_banner')->count();
        $interstitialCount = TelemetryEvent::where('type', 'ad_watch_interstitial')->count();
        $rewardedCount = TelemetryEvent::where('type', 'ad_watch_rewarded')->count();
        $smartlinkCount = TelemetryEvent::where('type', 'smartlink_click')->count();

        // In case event logging is young, use user-aggregate aggregates as minimum counts
        $interstitialCount = max($interstitialCount, round($totalAds * 0.7));
        $rewardedCount = max($rewardedCount, round($totalAds * 0.3));
        $smartlinkCount = max($smartlinkCount, $totalSmartlinks);
        
        // Add default estimations for banner counts based on traffic
        $bannerCount = max($bannerCount, $totalUsers * 3);

        // Revenue calculation
        $revenue = ($bannerCount * $bannerRate) +
                   ($interstitialCount * $interstitialRate) +
                   ($rewardedCount * $rewardedRate) +
                   ($smartlinkCount * $smartlinkRate);

        $campaignVisits = TelemetryEvent::where('type', 'campaign_traffic')->count();
        $metaCampaignVisits = TelemetryEvent::where('type', 'campaign_traffic')->where('details', 'like', '%meta%')->count();
        $downloadClicks = TelemetryEvent::where('type', 'download_click')->count();
        $metaDownloadClicks = TelemetryEvent::where('type', 'download_click')->where('details', 'like', '%meta%')->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'newUsersToday' => $newUsersToday,
            'totalAdsWatched' => $totalAds,
            'totalSmartlinkClicks' => $totalSmartlinks,
            'coinsInCirculation' => $totalCoins,
            'levelsCompleted' => intval($levelsCompleted),
            'estimatedRevenue' => round($revenue, 2),
            'bannersCount' => $bannerCount,
            'interstitialsCount' => intval($interstitialCount),
            'rewardedCount' => intval($rewardedCount),
            'campaignVisits' => $campaignVisits,
            'metaCampaignVisits' => $metaCampaignVisits,
            'downloadClicks' => $downloadClicks,
            'metaDownloadClicks' => $metaDownloadClicks,
        ]);
    }

    /**
     * Get recent telemetry events.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function events()
    {
        $events = TelemetryEvent::with('user')
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get();

        $formatted = $events->map(function ($event) {
            $details = json_decode($event->details, true);
            $detailStr = '';
            
            // Format details human-readably based on event type
            if ($event->type === 'level_complete') {
                $level = $details['level'] ?? 1;
                $detailStr = "Completed Level $level";
            } elseif ($event->type === 'ad_watch_interstitial') {
                $detailStr = "Viewed sponsored interstitial ad";
            } elseif ($event->type === 'ad_watch_banner') {
                $detailStr = "Banner ad displayed";
            } elseif ($event->type === 'ad_watch_rewarded') {
                $detailStr = "Rewarded video ad completed";
            } elseif ($event->type === 'smartlink_click') {
                $detailStr = "Visited smartlink offer";
            } elseif ($event->type === 'coin_spend') {
                $item = $details['item'] ?? 'Hint';
                $cost = $details['cost'] ?? 100;
                $detailStr = "Spent $cost coins on $item";
            } elseif ($event->type === 'invite_sent') {
                $platform = $details['platform'] ?? 'Link';
                $detailStr = "Sent invite share via $platform";
            } elseif ($event->type === 'campaign_traffic') {
                $source = $details['source'] ?? 'ad';
                $detailStr = "Visited from campaign: $source";
            } elseif ($event->type === 'download_click') {
                $campaign = $details['campaign'] ?? 'organic';
                $detailStr = "Clicked Download Game button (Campaign: $campaign)";
            } elseif ($event->type === 'download_complete') {
                $campaign = $details['campaign'] ?? 'organic';
                $detailStr = "Installed app successfully (Campaign: $campaign)";
            } else {
                $detailStr = $details['detail'] ?? 'Action performed';
            }

            return [
                'timestamp' => $event->created_at->toISOString(),
                'userId' => $event->user_id,
                'username' => $event->user->username ?? 'Guest_' . substr($event->user_id, -4),
                'type' => $event->type,
                'details' => $detailStr,
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Get all synchronized users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function users()
    {
        $users = User::orderBy('updated_at', 'desc')->get();
        return response()->json($users);
    }

    /**
     * Get CPM rates.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRates()
    {
        $rates = CpmRate::pluck('rate', 'ad_type')->all();
        return response()->json($rates);
    }

    /**
     * Save/update customized AdsTerra CPM rates.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveRates(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'banner' => 'required|numeric|min:0',
            'interstitial' => 'required|numeric|min:0',
            'rewarded' => 'required|numeric|min:0',
            'smartlink' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        foreach ($request->only(['banner', 'interstitial', 'rewarded', 'smartlink']) as $type => $rate) {
            CpmRate::updateOrCreate(
                ['ad_type' => $type],
                ['rate' => floatval($rate)]
            );
        }

        return response()->json([
            'success' => true,
            'rates' => CpmRate::pluck('rate', 'ad_type')->all()
        ]);
     }

    /**
     * Purge all telemetry events and users from the database, and reset CPM rates.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function reset()
    {
        // Delete all telemetry events first due to foreign key constraints
        TelemetryEvent::query()->delete();
        
        // Delete all users
        User::query()->delete();
        
        // Reset CPM rates to defaults
        CpmRate::query()->delete();
        CpmRate::insert([
            ['ad_type' => 'banner', 'rate' => 0.0050, 'created_at' => now(), 'updated_at' => now()],
            ['ad_type' => 'interstitial', 'rate' => 0.0400, 'created_at' => now(), 'updated_at' => now()],
            ['ad_type' => 'rewarded', 'rate' => 0.0700, 'created_at' => now(), 'updated_at' => now()],
            ['ad_type' => 'smartlink', 'rate' => 0.1800, 'created_at' => now(), 'updated_at' => now()]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Database successfully purged and reset.'
        ]);
    }
}
