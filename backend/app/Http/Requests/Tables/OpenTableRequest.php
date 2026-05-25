<?php

namespace App\Http\Requests\Tables;

use Illuminate\Foundation\Http\FormRequest;

class OpenTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
        ];
    }
}
