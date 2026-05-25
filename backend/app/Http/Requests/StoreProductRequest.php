<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:2048',
            'price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
            'stock_quantity' => 'nullable|integer|min:0',
        ];
    }
}
