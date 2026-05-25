<?php

namespace App\Repositories\Products;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function paginateWithCategory(array $filters = [], int $perPage = 30): LengthAwarePaginator
    {
        $query = Product::with('category');

        if (array_key_exists('search', $filters) && $filters['search'] !== null) {
            $search = '%'.$filters['search'].'%';

            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', $search)
                    ->orWhere('description', 'like', $search);
            });
        }

        if (array_key_exists('category_id', $filters) && $filters['category_id'] !== null) {
            $query->where('category_id', $filters['category_id']);
        }

        if (array_key_exists('is_available', $filters) && $filters['is_available'] !== null) {
            $query->where('is_available', filter_var($filters['is_available'], FILTER_VALIDATE_BOOLEAN));
        }

        if (array_key_exists('min_price', $filters) && $filters['min_price'] !== null) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (array_key_exists('max_price', $filters) && $filters['max_price'] !== null) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (array_key_exists('in_stock', $filters) && $filters['in_stock'] !== null) {
            $inStock = filter_var($filters['in_stock'], FILTER_VALIDATE_BOOLEAN);

            $query->where(function ($query) use ($inStock) {
                if ($inStock) {
                    $query->whereNull('stock_quantity')->orWhere('stock_quantity', '>', 0);

                    return;
                }

                $query->where('stock_quantity', '<=', 0);
            });
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function create(array $data): Product
    {
        return Product::create($data)->load('category');
    }

    public function findOrFail(int $id): Product
    {
        return Product::findOrFail($id);
    }

    public function lockById(int $id): Product
    {
        return Product::whereKey($id)->lockForUpdate()->firstOrFail();
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

    public function updateAvailability(Product $product, bool $isAvailable): Product
    {
        $product->update(['is_available' => $isAvailable]);

        return $product->fresh('category');
    }

    public function decrementStock(Product $product, int $quantity): Product
    {
        if ($product->stock_quantity === null) {
            return $product;
        }

        $product->decrement('stock_quantity', $quantity);

        return $product->fresh();
    }

    public function incrementStock(Product $product, int $quantity): Product
    {
        if ($product->stock_quantity === null) {
            return $product;
        }

        $product->increment('stock_quantity', $quantity);

        return $product->fresh();
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
