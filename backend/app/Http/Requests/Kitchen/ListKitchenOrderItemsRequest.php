<?php

namespace App\Http\Requests\Kitchen;

use App\Enums\OrderItemStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListKitchenOrderItemsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', Rule::in(OrderItemStatus::kitchenQueueValues())],
            'order_id' => ['sometimes', 'required', 'integer', 'exists:orders,id'],
            'per_page' => ['sometimes', 'required', 'integer', 'min:1', 'max:100'],
        ];
    }
}
