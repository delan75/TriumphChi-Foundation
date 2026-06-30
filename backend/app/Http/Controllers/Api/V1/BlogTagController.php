<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogTagRequest;
use App\Http\Resources\BlogTagResource;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogTagController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogTag::query()
            ->withCount(['posts'])
            ->orderBy('created_at');

        if (! $request->user()?->can('blog_tags.manage')) {
            $query->where('is_active', true);
        }

        return $this->success(
            BlogTagResource::collection($query->get())->resolve(),
            __('api.blog.tags_retrieved'),
        );
    }

    public function store(StoreBlogTagRequest $request)
    {
        $tag = BlogTag::create($this->preparePayload($request->validated()));

        return $this->created(
            BlogTagResource::make($tag)->resolve(),
            __('api.blog.tag_created'),
        );
    }

    public function update(StoreBlogTagRequest $request, BlogTag $blogTag)
    {
        $blogTag->update($this->preparePayload($request->validated(), $blogTag));

        return $this->updated(
            BlogTagResource::make($blogTag->refresh())->resolve(),
            __('api.blog.tag_updated'),
        );
    }

    public function destroy(BlogTag $blogTag)
    {
        $blogTag->posts()->detach();
        $blogTag->delete();

        return $this->deleted(__('api.blog.tag_deleted'));
    }

    private function preparePayload(array $payload, ?BlogTag $tag = null): array
    {
        $payload['slug'] = $this->localizedSlugs($payload['slug'] ?? [], $payload['name'], $tag?->id);
        $payload['is_active'] = $payload['is_active'] ?? true;

        return $payload;
    }

    private function localizedSlugs(array $slugs, array $names, ?int $ignoreId = null): array
    {
        return collect(['en', 'fr'])->mapWithKeys(function (string $locale) use ($slugs, $names, $ignoreId) {
            $source = $slugs[$locale] ?? $names[$locale] ?? $names['en'] ?? 'tag';
            $base = Str::slug($source) ?: 'tag';
            $candidate = $base;
            $suffix = 2;

            while (BlogTag::query()
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where("slug->{$locale}", $candidate)
                ->exists()) {
                $candidate = "{$base}-{$suffix}";
                $suffix++;
            }

            return [$locale => $candidate];
        })->all();
    }
}
