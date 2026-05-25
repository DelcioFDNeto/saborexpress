<?php

namespace App\Enums;

enum OrderItemStatus: string
{
    case Pending = 'Pendente';
    case Preparing = 'Em Preparo';
    case Ready = 'Pronto';
    case Delivered = 'Entregue';

    public static function kitchenQueueValues(): array
    {
        return [
            self::Pending->value,
            self::Preparing->value,
            self::Ready->value,
        ];
    }

    public static function unfinishedKitchenValues(): array
    {
        return [
            self::Pending->value,
            self::Preparing->value,
        ];
    }

    public static function undeliveredValues(): array
    {
        return [
            self::Pending->value,
            self::Preparing->value,
            self::Ready->value,
        ];
    }
}
