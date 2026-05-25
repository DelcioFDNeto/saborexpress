<?php

namespace App\Http\Requests\Tables;

use Illuminate\Foundation\Http\FormRequest;

class ReserveTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_name' => ['nullable', 'string', 'max:255'],
            'reservation_phone' => ['nullable', 'string', 'max:30'],
            'reserved_at' => ['nullable', 'date'],
        ];
    }
}
