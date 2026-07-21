<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBlogCategoryRequest;
use App\Http\Resources\BlogCategoryResource;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogCategory::query()
            ->withCount(['posts'])
            ->orderBy('sort_order')
            ->orderBy('created_at');

        if (! $request->user()?->can('blog_categories.manage')) {
            $query->where('is_active', true);
        }

        return $this->success(
            BlogCategoryResource::collection($query->get())->resolve(),
            __('api.blog.categories_retrieved'),
        );
    }

    public function store(StoreBlogCategoryRequest $request)
    {
        $payload = $this->preparePayload($request->validated());

        $category = BlogCategory::create($payload);

        return $this->created(
            BlogCategoryResource::make($category)->resolve(),
            __('api.blog.category_created'),
        );
    }

    public function update(StoreBlogCategoryRequest $request, BlogCategory $blogCategory)
    {
        $blogCategory->update($this->preparePayload($request->validated(), $blogCategory));

        return $this->updated(
            BlogCategoryResource::make($blogCategory->refresh())->resolve(),
            __('api.blog.category_updated'),
        );
    }

    public function destroy(BlogCategory $blogCategory)
    {
        if ($blogCategory->posts()->exists()) {
            return $this->error(__('api.blog.category_in_use'), 422);
        }

        $blogCategory->delete();

        return $this->deleted(__('api.blog.category_deleted'));
    }

    private function preparePayload(array $payload, ?BlogCategory $category = null): array
    {
        $payload['slug'] = $this->localizedSlugs(
            $payload['slug'] ?? [],
            $payload['name'],
            BlogCategory::class,
            $category?->id,
        );
        $payload['is_active'] = $payload['is_active'] ?? true;
        $payload['sort_order'] = $payload['sort_order'] ?? 0;

        return $payload;
    }

    private function localizedSlugs(array $slugs, array $names, string $modelClass, ?int $ignoreId = null): array
    {
        return collect(['en', 'fr'])->mapWithKeys(function (string $locale) use ($slugs, $names, $modelClass, $ignoreId) {
            $source = $slugs[$locale] ?? $names[$locale] ?? $names['en'] ?? 'category';
            $base = Str::slug($source) ?: 'category';
            $candidate = $base;
            $suffix = 2;

            while ($modelClass::query()
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
