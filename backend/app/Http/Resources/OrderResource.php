<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'table_id' => $this->table_id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'type' => $this->type,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'delivery_address' => $this->delivery_address,
            'delivery_status' => $this->delivery_status,
            'total_amount' => $this->total_amount,
            'discount' => $this->discount,
            'service_fee' => $this->service_fee,
            'table' => $this->whenLoaded('table'),
            'user' => $this->whenLoaded('user'),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
