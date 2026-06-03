<?php

namespace App\Http\Requests\Payments;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('method') === 'Cartão') {
            $this->merge(['method' => 'Cartao']);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string|in:Pix,Cartao,Dinheiro',
            'installments' => 'nullable|integer|min:1|max:12',
        ];
    }
}
