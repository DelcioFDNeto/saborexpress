<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'capacity' => $this->capacity,
            'status' => $this->status,
            'reservation_name' => $this->reservation_name,
            'reservation_phone' => $this->reservation_phone,
            'reserved_at' => $this->reserved_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
