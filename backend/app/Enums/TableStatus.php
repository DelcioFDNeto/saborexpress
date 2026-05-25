<?php

namespace App\Enums;

enum TableStatus: string
{
    case Free = 'Livre';
    case Occupied = 'Ocupada';
    case Reserved = 'Reservada';
    case Closing = 'Fechamento';
    case Cleaning = 'Limpeza';
}
