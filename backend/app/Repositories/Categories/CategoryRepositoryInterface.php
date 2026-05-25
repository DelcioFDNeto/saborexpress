<?php

namespace App\Repositories\Categories;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CategoryRepositoryInterface
{
    public function paginateWithProducts(int $perPage = 30): LengthAwarePaginator;

    public function create(array $data): Category;

    public function loadProducts(Category $category): Category;

    public function update(Category $category, array $data): Category;

    public function delete(Category $category): void;
}
