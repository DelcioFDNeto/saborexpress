<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Repositories\Categories\CategoryRepositoryInterface;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categories,
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return CategoryResource::collection($this->categories->paginateWithProducts());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = $this->categories->create($request->validated());
        return new CategoryResource($category);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return new CategoryResource($this->categories->loadProducts($category));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        return new CategoryResource($this->categories->update($category, $request->validated()));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $this->categories->delete($category);
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
