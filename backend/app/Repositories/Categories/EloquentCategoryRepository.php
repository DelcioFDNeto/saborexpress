<?php

namespace App\Repositories\Categories;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentCategoryRepository implements CategoryRepositoryInterface
{
    public function paginateWithProducts(int $perPage = 30): LengthAwarePaginator
    {
        return Category::with('products')->paginate($perPage);
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function loadProducts(Category $category): Category
    {
        return $category->load('products');
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->fresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}
