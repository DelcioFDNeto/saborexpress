<?php

namespace App\Repositories\Tables;

use App\Models\Table;
use Illuminate\Support\Collection;

class EloquentTableRepository implements TableRepositoryInterface
{
    public function allOrdered(): Collection
    {
        return Table::orderBy('number')->get();
    }

    public function create(array $data): Table
    {
        return Table::create($data);
    }

    public function update(Table $table, array $data): Table
    {
        $table->update($data);

        return $table->fresh();
    }

    public function delete(Table $table): void
    {
        $table->delete();
    }

    public function lockById(int $id): Table
    {
        return Table::whereKey($id)->lockForUpdate()->firstOrFail();
    }
}
