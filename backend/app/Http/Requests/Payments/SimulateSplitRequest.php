<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class SimulateSplitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'split_type' => ['required', 'in:integral,equal,items'],
            'num_people' => ['required_if:split_type,equal', 'integer', 'min:1'],
            'item_ids' => ['nullable', 'array'],
            'item_ids.*' => ['integer', 'exists:order_items,id'],
        ];
    }
}
