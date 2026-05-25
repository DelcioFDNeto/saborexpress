<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Enums\AuditEventType;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Repositories\Categories\CategoryRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categories,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

    public function index()
    {
        return CategoryResource::collection($this->categories->paginateWithProducts());
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = $this->categories->create($request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::CategoryCreated, $category);

        return new CategoryResource($category);
    }

    public function show(Category $category)
    {
        return new CategoryResource($this->categories->loadProducts($category));
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category = $this->categories->update($category, $request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::CategoryUpdated, $category);

        return new CategoryResource($category);
    }

    public function destroy(Request $request, Category $category)
    {
        $this->recordAuditEvent->execute($request->user(), AuditEventType::CategoryDeleted, $category, [
            'name' => $category->name,
        ]);
        $this->categories->delete($category);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
