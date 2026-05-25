<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class ListProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'is_available' => ['sometimes', 'required', 'boolean'],
            'min_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'required', 'numeric', 'min:0', 'gte:min_price'],
            'in_stock' => ['sometimes', 'required', 'boolean'],
            'per_page' => ['sometimes', 'required', 'integer', 'min:1', 'max:100'],
        ];
    }
}
