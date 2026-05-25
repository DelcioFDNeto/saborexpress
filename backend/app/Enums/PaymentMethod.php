<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Pix = 'Pix';
    case Card = 'Cartao';
    case Cash = 'Dinheiro';
}
