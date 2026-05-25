<?php

namespace App\Events;

use App\Models\OrderItem;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderItemMarkedReady
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly OrderItem $orderItem,
    ) {}
}
