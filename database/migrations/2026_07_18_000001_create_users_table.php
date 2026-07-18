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
        Schema::create('users', function (Blueprint $table) {
            $table->string('id')->primary(); // U-XXXXXX
            $table->string('username');
            $table->string('device');
            $table->string('country');
            $table->integer('coins')->default(200);
            $table->integer('level_reached')->default(1);
            $table->integer('ads_watched')->default(0);
            $table->integer('smartlink_clicks')->default(0);
            $table->string('status')->default('Live'); // Live, Idle, Banned
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
