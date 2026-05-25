<?php

namespace App\Repositories\Tables;

use App\Models\Table;
use Illuminate\Support\Collection;

interface TableRepositoryInterface
{
    public function allOrdered(): Collection;

    public function create(array $data): Table;

    public function update(Table $table, array $data): Table;

    public function delete(Table $table): void;

    public function lockById(int $id): Table;
}
