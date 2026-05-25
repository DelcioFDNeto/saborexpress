<?php

namespace App\Http\Requests\Audit;

use App\Enums\AuditEventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListAuditEventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event' => ['sometimes', 'required', Rule::enum(AuditEventType::class)],
            'user_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'auditable_type' => ['sometimes', 'required', 'string', 'max:255'],
            'auditable_id' => ['sometimes', 'required', 'integer'],
            'date_from' => ['sometimes', 'required', 'date'],
            'date_to' => ['sometimes', 'required', 'date', Rule::when($this->filled('date_from'), ['after_or_equal:date_from'])],
            'per_page' => ['sometimes', 'required', 'integer', 'min:1', 'max:100'],
        ];
    }
}
