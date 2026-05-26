<?php

namespace App\Actions\CashMovements;

use App\Models\CashMovement;
use App\Repositories\CashMovements\CashMovementRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CreateCashMovementAction
{
    public function __construct(
        private readonly CashMovementRepositoryInterface $cashMovements,
    ) {}

    /**
     * Create a cash movement, validating balance for Sangria operations.
     */
    public function execute(array $data): CashMovement
    {
        if ($data['type'] === 'Sangria') {
            $cashBalance = $this->cashMovements->todayCashBalance();

            if ($data['amount'] > $cashBalance) {
                throw new UnprocessableEntityHttpException('Saldo insuficiente em caixa para a sangria.');
            }
        }

        $movement = $this->cashMovements->create($data);

        return $movement->load('user');
    }
}
