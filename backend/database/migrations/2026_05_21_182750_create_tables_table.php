<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->integer('capacity')->default(4);
            $table->enum('status', ['Livre', 'Ocupada', 'Reservada', 'Fechamento', 'Limpeza'])->default('Livre');
            $table->string('reservation_name')->nullable();
            $table->string('reservation_phone', 30)->nullable();
            $table->timestamp('reserved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
