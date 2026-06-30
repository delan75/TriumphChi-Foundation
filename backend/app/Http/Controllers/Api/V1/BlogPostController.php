<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListBlogPostRequest;
use App\Http\Requests\StoreBlogPostRequest;
use App\Http\Requests\TransitionBlogPostStatusRequest;
use App\Http\Resources\BlogCategoryResource;
use App\Http\Resources\BlogPostResource;
use App\Http\Resources\BlogTagResource;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    public function publicIndex(Request $request)
    {
        $locale = $this->locale($request);
        $query = $this->basePublicQuery($locale)
            ->when($request->filled('category'), fn ($query) => $query->whereHas(
                'category',
                fn ($category) => $category->where("slug->{$locale}", $request->string('category')->toString()),
            ))
            ->when($request->filled('tag'), fn ($query) => $query->whereHas(
                'tags',
                fn ($tag) => $tag->where("slug->{$locale}", $request->string('tag')->toString()),
            ))
            ->when($request->filled('search'), function ($query) use ($locale, $request) {
                $search = '%'.$request->string('search')->toString().'%';
                $query->where(function ($inner) use ($locale, $search) {
                    $inner
                        ->where("title->{$locale}", 'like', $search)
                        ->orWhere("excerpt->{$locale}", 'like', $search)
                        ->orWhere("title->en", 'like', $search)
                        ->orWhere("excerpt->en", 'like', $search);
                });
            });

        return $this->paginated(
            $query->paginate($request->integer('per_page', 9)),
            __('api.blog.public_posts_retrieved'),
            BlogPostResource::class,
        );
    }

    public function publicShow(Request $request, string $slug)
    {
        $locale = $this->locale($request);
        $post = $this->basePublicQuery($locale)
            ->where(function ($query) use ($locale, $slug) {
                $query
                    ->where("slug->{$locale}", $slug)
                    ->orWhere('slug->en', $slug);
            })
            ->first();

        if (! $post) {
            return $this->notFound(__('api.blog.post_not_found'));
        }

        return $this->success(
            BlogPostResource::make($post)->resolve(),
            __('api.blog.public_post_retrieved'),
        );
    }

    public function publicOptions(Request $request)
    {
        return $this->success([
            'categories' => BlogCategoryResource::collection(
                BlogCategory::query()->where('is_active', true)->withCount(['posts' => fn ($query) => $query->published()])->orderBy('sort_order')->get(),
            )->resolve(),
            'tags' => BlogTagResource::collection(
                BlogTag::query()->where('is_active', true)->withCount(['posts' => fn ($query) => $query->published()])->orderBy('created_at')->get(),
            )->resolve(),
        ], __('api.blog.options_retrieved'));
    }

    public function index(ListBlogPostRequest $request)
    {
        $locale = $this->locale($request);
        $query = BlogPost::query()
            ->with(['category', 'tags', 'author', 'publisher'])
            ->withCount(['tags'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->boolean('featured'), fn ($query) => $query->where('is_featured', true))
            ->when($request->filled('search'), function ($query) use ($request, $locale) {
                $search = '%'.$request->string('search')->toString().'%';
                $query->where(function ($inner) use ($search, $locale) {
                    $inner
                        ->where('reference', 'like', $search)
                        ->orWhere("title->{$locale}", 'like', $search)
                        ->orWhere("excerpt->{$locale}", 'like', $search)
                        ->orWhere('title->en', 'like', $search)
                        ->orWhere('excerpt->en', 'like', $search);
                });
            });

        $sort = $request->string('sort', 'created_at')->toString();
        $direction = $request->string('direction', 'desc')->toString();

        if ($sort === 'title') {
            $query->orderBy("title->{$locale}", $direction);
        } else {
            $query->orderBy($sort, $direction);
        }

        $paginator = $query->paginate($request->integer('per_page', 12));
        $response = $this->paginated($paginator, __('api.blog.posts_retrieved'), BlogPostResource::class);
        $payload = $response->getData(true);
        $payload['summary'] = $this->summary();

        return response()->json($payload);
    }

    public function options()
    {
        return $this->success([
            'categories' => BlogCategoryResource::collection(BlogCategory::query()->withCount('posts')->orderBy('sort_order')->get())->resolve(),
            'tags' => BlogTagResource::collection(BlogTag::query()->withCount('posts')->orderBy('created_at')->get())->resolve(),
            'statuses' => collect(['draft', 'review', 'published', 'archived'])->map(fn (string $status) => [
                'value' => $status,
                'label' => __('labels.blog_post_statuses.'.$status),
            ])->values(),
        ], __('api.blog.options_retrieved'));
    }

    public function store(StoreBlogPostRequest $request)
    {
        if ($request->input('status') === BlogPost::STATUS_PUBLISHED && ! $request->user()?->can('blog_posts.publish')) {
            return $this->forbidden(__('api.blog.publish_forbidden'));
        }

        $post = DB::transaction(function () use ($request) {
            $payload = $this->preparePostPayload($request->validated(), userId: $request->user()->id);
            $tagIds = $payload['tag_ids'] ?? [];
            unset($payload['tag_ids']);

            $post = BlogPost::create($payload);
            $post->tags()->sync($tagIds);

            return $post->load(['category', 'tags', 'author', 'publisher']);
        });

        return $this->created(
            BlogPostResource::make($post)->resolve(),
            __('api.blog.post_created'),
        );
    }

    public function show(BlogPost $blogPost)
    {
        return $this->success(
            BlogPostResource::make($blogPost->load(['category', 'tags', 'author', 'publisher']))->resolve(),
            __('api.blog.post_retrieved'),
        );
    }

    public function update(StoreBlogPostRequest $request, BlogPost $blogPost)
    {
        if ($request->input('status') === BlogPost::STATUS_PUBLISHED && ! $request->user()?->can('blog_posts.publish')) {
            return $this->forbidden(__('api.blog.publish_forbidden'));
        }

        $blogPost = DB::transaction(function () use ($request, $blogPost) {
            $payload = $this->preparePostPayload($request->validated(), $blogPost, $request->user()->id);
            $tagIds = $payload['tag_ids'] ?? null;
            unset($payload['tag_ids']);

            $blogPost->update($payload);

            if (is_array($tagIds)) {
                $blogPost->tags()->sync($tagIds);
            }

            return $blogPost->refresh()->load(['category', 'tags', 'author', 'publisher']);
        });

        return $this->updated(
            BlogPostResource::make($blogPost)->resolve(),
            __('api.blog.post_updated'),
        );
    }

    public function transition(TransitionBlogPostStatusRequest $request, BlogPost $blogPost)
    {
        $status = $request->string('status')->toString();

        $blogPost->forceFill([
            'status' => $status,
            'published_by' => $status === BlogPost::STATUS_PUBLISHED ? $request->user()->id : $blogPost->published_by,
            'published_at' => $status === BlogPost::STATUS_PUBLISHED ? ($blogPost->published_at ?? now()) : $blogPost->published_at,
            'archived_at' => $status === BlogPost::STATUS_ARCHIVED ? now() : null,
        ])->save();

        return $this->updated(
            BlogPostResource::make($blogPost->refresh()->load(['category', 'tags', 'author', 'publisher']))->resolve(),
            __('api.blog.post_status_updated'),
        );
    }

    public function destroy(BlogPost $blogPost)
    {
        $blogPost->delete();

        return $this->deleted(__('api.blog.post_deleted'));
    }

    private function basePublicQuery(string $locale)
    {
        return BlogPost::query()
            ->published()
            ->with(['category', 'tags', 'author'])
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->whereNotNull("title->{$locale}");
    }

    private function preparePostPayload(array $payload, ?BlogPost $post = null, ?int $userId = null): array
    {
        $payload['slug'] = $this->localizedSlugs($payload['slug'] ?? [], $payload['title'], $post?->id);
        $payload['reading_minutes'] = $this->readingMinutes($payload['body']);
        $payload['author_id'] = $post?->author_id ?? $userId;
        $payload['status'] = $payload['status'] ?? $post?->status ?? BlogPost::STATUS_DRAFT;
        $payload['is_featured'] = $payload['is_featured'] ?? false;

        if ($payload['status'] === BlogPost::STATUS_PUBLISHED) {
            $payload['published_by'] = $userId;
            $payload['published_at'] = $payload['published_at'] ?? $post?->published_at ?? now();
            $payload['archived_at'] = null;
        }

        if ($payload['status'] === BlogPost::STATUS_ARCHIVED) {
            $payload['archived_at'] = $post?->archived_at ?? now();
        }

        return $payload;
    }

    private function localizedSlugs(array $slugs, array $titles, ?int $ignoreId = null): array
    {
        return collect(['en', 'fr'])->mapWithKeys(function (string $locale) use ($slugs, $titles, $ignoreId) {
            $source = $slugs[$locale] ?? $titles[$locale] ?? $titles['en'] ?? 'post';
            $base = Str::slug($source) ?: 'post';
            $candidate = $base;
            $suffix = 2;

            while (BlogPost::query()
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where("slug->{$locale}", $candidate)
                ->exists()) {
                $candidate = "{$base}-{$suffix}";
                $suffix++;
            }

            return [$locale => $candidate];
        })->all();
    }

    private function readingMinutes(array $body): int
    {
        $text = trim(implode(' ', array_filter($body)));
        $words = str_word_count(strip_tags($text));

        return max(1, (int) ceil($words / 220));
    }

    private function summary(): array
    {
        $counts = BlogPost::query()
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status')
            ->map(fn ($count) => (int) $count)
            ->all();

        return [
            'total_count' => array_sum($counts),
            'status_counts' => $counts,
            'draft_count' => $counts['draft'] ?? 0,
            'review_count' => $counts['review'] ?? 0,
            'published_count' => $counts['published'] ?? 0,
            'archived_count' => $counts['archived'] ?? 0,
        ];
    }

    private function locale(Request $request): string
    {
        return in_array($request->getPreferredLanguage(['en', 'fr']), ['en', 'fr'], true)
            ? $request->getPreferredLanguage(['en', 'fr'])
            : app()->getLocale();
    }
}
