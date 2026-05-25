<?php

namespace App\Http\Requests\Tables;

use App\Enums\TableStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'number' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('tables', 'number')->ignore($this->route('table'))],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
            'status' => ['sometimes', 'required', Rule::enum(TableStatus::class)],
            'reservation_name' => ['nullable', 'string', 'max:255'],
            'reservation_phone' => ['nullable', 'string', 'max:30'],
            'reserved_at' => ['nullable', 'date'],
        ];
    }
}
