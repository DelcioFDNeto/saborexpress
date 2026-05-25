<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Enums\AuditEventType;
use App\Http\Requests\Products\ListProductsRequest;
use App\Http\Requests\Products\UpdateProductAvailabilityRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Repositories\Products\ProductRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductRepositoryInterface $products,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

    public function index(ListProductsRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 30);

        return ProductResource::collection(
            $this->products->paginateWithCategory($validated, $perPage)
        );
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->products->create($request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::ProductCreated, $product);

        return new ProductResource($product);
    }

    public function show(Product $product)
    {
        return new ProductResource($this->products->loadCategory($product));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product = $this->products->update($product, $request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::ProductUpdated, $product);

        return new ProductResource($product);
    }

    public function updateAvailability(UpdateProductAvailabilityRequest $request, Product $product)
    {
        $product = $this->products->updateAvailability($product, $request->validated('is_available'));
        $this->recordAuditEvent->execute($request->user(), AuditEventType::ProductAvailabilityUpdated, $product, [
            'is_available' => $product->is_available,
        ]);

        return new ProductResource($product);
    }

    public function destroy(Request $request, Product $product)
    {
        $this->recordAuditEvent->execute($request->user(), AuditEventType::ProductDeleted, $product, [
            'name' => $product->name,
        ]);
        $this->products->delete($product);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
