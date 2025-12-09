<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_box')->nullable()->after('status');
            $table->string('box_supplier')->default('satar')->after('shipping_box');
            $table->unsignedTinyInteger('box_padding')->default(1)->after('box_supplier');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_box', 'box_supplier', 'box_padding']);
        });
    }
};
