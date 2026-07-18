<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cpm_rates', function (Blueprint $table) {
            $table->string('ad_type')->primary(); // banner, interstitial, rewarded, smartlink
            $table->decimal('rate', 8, 4);
            $table->timestamps();
        });

        // Insert default AdsTerra CPM rates
        DB::table('cpm_rates')->insert([
            ['ad_type' => 'banner', 'rate' => 0.005, 'created_at' => now(), 'updated_at' => now()],
            ['ad_type' => 'interstitial', 'rate' => 0.04, 'created_at' => now(), 'updated_at' => now()],
            ['ad_type' => 'rewarded', 'rate' => 0.07, 'created_at' => now(), 'updated_at' => now()],
            ['ad_type' => 'smartlink', 'rate' => 0.18, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cpm_rates');
    }
};
