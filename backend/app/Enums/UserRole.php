<?php

namespace App\Enums;

enum UserRole: string
{
    case Administrator = 'administrator';
    case Waiter = 'waiter';
    case Kitchen = 'kitchen';
    case Cashier = 'cashier';
    case Delivery = 'delivery';
    case Client = 'client';
}
