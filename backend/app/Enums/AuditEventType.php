<?php

namespace App\Enums;

enum AuditEventType: string
{
    case UserCreated = 'user.created';
    case UserUpdated = 'user.updated';
    case UserPasswordChanged = 'user.password_changed';
    case UserActivated = 'user.activated';
    case UserDeactivated = 'user.deactivated';
    case UserDeleted = 'user.deleted';
    case CategoryCreated = 'category.created';
    case CategoryUpdated = 'category.updated';
    case CategoryDeleted = 'category.deleted';
    case ProductCreated = 'product.created';
    case ProductUpdated = 'product.updated';
    case ProductAvailabilityUpdated = 'product.availability_updated';
    case ProductDeleted = 'product.deleted';
    case TableCreated = 'table.created';
    case TableUpdated = 'table.updated';
    case TableDeleted = 'table.deleted';
    case TableOpened = 'table.opened';
    case TableReserved = 'table.reserved';
    case TableReservationCanceled = 'table.reservation_canceled';
    case TableReleased = 'table.released';
    case TableMarkedFree = 'table.marked_free';
    case TableOrderTransferred = 'table.order_transferred';
    case TableOrdersMerged = 'table.orders_merged';
    case OrderItemAdded = 'order_item.added';
    case OrderItemUpdated = 'order_item.updated';
    case OrderItemRemoved = 'order_item.removed';
    case OrderItemCanceled = 'order_item.canceled';
    case OrderItemDelivered = 'order_item.delivered';
    case KitchenItemStarted = 'kitchen.item_started';
    case KitchenItemReady = 'kitchen.item_ready';
    case OrderClosingRequested = 'order.closing_requested';
    case OrderCanceled = 'order.canceled';
    case PaymentRegistered = 'payment.registered';
}
