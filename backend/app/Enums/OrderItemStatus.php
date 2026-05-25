<?php

namespace App\Enums;

enum OrderItemStatus: string
{
    case Pending = 'Pendente';
    case Preparing = 'Em Preparo';
    case Ready = 'Pronto';
    case Delivered = 'Entregue';
}
