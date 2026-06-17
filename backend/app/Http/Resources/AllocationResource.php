<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AllocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fund_id' => $this->fund_id,
            'educational_need_id' => $this->educational_need_id,
            'amount' => $this->amount,
            'reason' => $this->reason,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
        ];
    }
}

