<?php

namespace App\Repositories\Products;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function paginateWithCategory(array $filters = [], int $perPage = 30): LengthAwarePaginator;

    public function create(array $data): Product;

    public function findOrFail(int $id): Product;

    public function lockById(int $id): Product;

    public function loadCategory(Product $product): Product;

    public function update(Product $product, array $data): Product;

    public function updateAvailability(Product $product, bool $isAvailable): Product;

    public function decrementStock(Product $product, int $quantity): Product;

    public function incrementStock(Product $product, int $quantity): Product;

    public function delete(Product $product): void;
}
