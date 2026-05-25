<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('street')->nullable()->after('delivery_address');
            $table->string('number')->nullable()->after('street');
            $table->string('neighborhood')->nullable()->after('number');
            $table->string('cep')->nullable()->after('neighborhood');
            $table->string('reference')->nullable()->after('cep');
            $table->foreignId('delivery_driver_id')->nullable()->after('reference')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['delivery_driver_id']);
            $table->dropColumn(['street', 'number', 'neighborhood', 'cep', 'reference', 'delivery_driver_id']);
        });
    }
};
