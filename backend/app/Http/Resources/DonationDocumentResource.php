<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DonationDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $public = str_starts_with((string) $request->route()?->getName(), 'api.v1.public.');
        $routeName = $public
            ? 'api.v1.public.donation-documents.download'
            : 'api.v1.donations.documents.download';

        return [
            'uuid' => $this->uuid,
            'document_number' => $this->document_number,
            'type' => $this->type,
            'status' => $this->status,
            'locale' => $this->locale,
            'title' => $this->title,
            'issued_at' => $this->issued_at,
            'download_url' => route($routeName, [
                'donation' => $this->donation->uuid,
                'document' => $this->uuid,
            ]),
        ];
    }
}
