<?php

namespace App\Actions\Orders;

use App\Models\Order;
use App\Repositories\Orders\OrderRepositoryInterface;

class RecalculateOrderTotalAction
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
    ) {}

    public function execute(Order $order): Order
    {
        return $this->orders->recalculateTotal($order);
    }
}
