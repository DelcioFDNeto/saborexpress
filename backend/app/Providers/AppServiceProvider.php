<?php

namespace App\Providers;

use App\Repositories\AuditEvents\AuditEventRepositoryInterface;
use App\Repositories\AuditEvents\EloquentAuditEventRepository;
use App\Repositories\Categories\CategoryRepositoryInterface;
use App\Repositories\Categories\EloquentCategoryRepository;
use App\Repositories\OrderItems\EloquentOrderItemRepository;
use App\Repositories\OrderItems\OrderItemRepositoryInterface;
use App\Repositories\Orders\EloquentOrderRepository;
use App\Repositories\Orders\OrderRepositoryInterface;
use App\Repositories\Payments\EloquentPaymentRepository;
use App\Repositories\Payments\PaymentRepositoryInterface;
use App\Repositories\Products\EloquentProductRepository;
use App\Repositories\Products\ProductRepositoryInterface;
use App\Repositories\Tables\EloquentTableRepository;
use App\Repositories\Tables\TableRepositoryInterface;
use App\Repositories\Users\EloquentUserRepository;
use App\Repositories\Users\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CategoryRepositoryInterface::class, EloquentCategoryRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(TableRepositoryInterface::class, EloquentTableRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, EloquentOrderRepository::class);
        $this->app->bind(OrderItemRepositoryInterface::class, EloquentOrderItemRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, EloquentPaymentRepository::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(AuditEventRepositoryInterface::class, EloquentAuditEventRepository::class);
    }

    public function boot(): void {}
}
