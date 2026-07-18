<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'username',
        'device',
        'country',
        'coins',
        'level_reached',
        'ads_watched',
        'smartlink_clicks',
        'status',
    ];

    /**
     * Get the telemetry events for the user.
     */
    public function events()
    {
        return $this->hasMany(TelemetryEvent::class, 'user_id', 'id');
    }
}
