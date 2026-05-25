<?php

namespace App\Repositories\Products;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function paginateWithCategory(array $filters = [], int $perPage = 30): LengthAwarePaginator
    {
        $query = Product::with('category');

        if (array_key_exists('category_id', $filters) && $filters['category_id'] !== null) {
            $query->where('category_id', $filters['category_id']);
        }

        if (array_key_exists('is_available', $filters) && $filters['is_available'] !== null) {
            $query->where('is_available', filter_var($filters['is_available'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->paginate($perPage);
    }

    public function create(array $data): Product
    {
        return Product::create($data)->load('category');
    }

    public function findOrFail(int $id): Product
    {
        return Product::findOrFail($id);
    }

    public function loadCategory(Product $product): Product
    {
        return $product->load('category');
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh('category');
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
