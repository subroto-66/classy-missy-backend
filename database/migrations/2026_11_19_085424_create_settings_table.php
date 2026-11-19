<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Insert initial default settings
        DB::table('settings')->insertOrIgnore([
            [
                'key' => 'admin_logo',
                'value' => '/logo.svg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'admin_title',
                'value' => 'Classy Missy',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'admin_subtitle',
                'value' => 'Admin Panel',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
