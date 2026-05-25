<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'user_id' => $this->user_id,
            'method' => $this->method,
            'status' => $this->status,
            'amount' => $this->amount,
            'paid_at' => $this->paid_at,
            'notes' => $this->notes,
            'order' => new OrderResource($this->whenLoaded('order')),
            'user' => $this->whenLoaded('user'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
