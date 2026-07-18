<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('telemetry_events', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->string('type'); // session_start, level_complete, ad_watch_interstitial, etc.
            $table->text('details')->nullable();
            $table->timestamps();

            // Foreign key relation (optional, since it's sqlite, we can enforce or not)
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('telemetry_events');
    }
};
