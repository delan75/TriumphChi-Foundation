<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogTagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->getPreferredLanguage(['en', 'fr']) ?: app()->getLocale();

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'label' => $this->localized($this->name, $locale),
            'slug' => $this->slug,
            'current_slug' => $this->localized($this->slug, $locale),
            'description' => $this->description,
            'current_description' => $this->localized($this->description, $locale),
            'is_active' => $this->is_active,
            'posts_count' => (int) ($this->posts_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function localized(?array $value, string $locale): ?string
    {
        return $value[$locale] ?? $value['en'] ?? collect($value)->filter()->first();
    }
}
