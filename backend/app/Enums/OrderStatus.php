<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Open = 'Aberta';
    case Closing = 'Fechamento';
    case Paid = 'Paga';
    case Canceled = 'Cancelada';

    public static function activeValues(): array
    {
        return [
            self::Open->value,
            self::Closing->value,
        ];
    }
}
