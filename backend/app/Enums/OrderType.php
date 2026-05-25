<?php

namespace App\Enums;

enum OrderType: string
{
    case Table = 'Mesa';
    case Delivery = 'Delivery';
    case Takeout = 'Takeout';
}
