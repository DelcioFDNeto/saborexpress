<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'Pendente';
    case Paid = 'Pago';
    case Canceled = 'Cancelado';
    case Refunded = 'Estornado';
}
