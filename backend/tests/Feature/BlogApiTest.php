<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class BlogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_blog_only_returns_published_articles(): void
    {
        $author = $this->user();
        $category = BlogCategory::create([
            'name' => ['en' => 'Education Support', 'fr' => 'Soutien scolaire'],
            'slug' => ['en' => 'education-support', 'fr' => 'soutien-scolaire'],
            'is_active' => true,
        ]);

        BlogPost::create([
            'author_id' => $author->id,
            'blog_category_id' => $category->id,
            'title' => ['en' => 'Keeping Children In School', 'fr' => 'Garder les enfants a l ecole'],
            'slug' => ['en' => 'keeping-children-in-school', 'fr' => 'garder-les-enfants-a-l-ecole'],
            'excerpt' => ['en' => 'How school support protects a child from leaving class.'],
            'body' => ['en' => 'School fees, books, uniforms, and encouragement can keep a child learning.'],
            'status' => BlogPost::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        BlogPost::create([
            'author_id' => $author->id,
            'title' => ['en' => 'Draft Field Note'],
            'slug' => ['en' => 'draft-field-note'],
            'body' => ['en' => 'Private draft.'],
            'status' => BlogPost::STATUS_DRAFT,
        ]);

        $this->getJson('/api/v1/public/blog-posts')
            ->assertOk()
            ->assertJsonPath('data.0.current_title', 'Keeping Children In School')
            ->assertJsonMissing(['current_title' => 'Draft Field Note']);
    }

    public function test_staff_can_create_and_publish_blog_post_with_permissions(): void
    {
        $staff = $this->user([
            'blog_posts.view',
            'blog_posts.create',
            'blog_posts.update',
            'blog_posts.publish',
            'blog_categories.manage',
            'blog_tags.manage',
        ]);
        $category = BlogCategory::create([
            'name' => ['en' => 'Field Notes'],
            'slug' => ['en' => 'field-notes'],
            'is_active' => true,
        ]);
        $tag = BlogTag::create([
            'name' => ['en' => 'School Fees'],
            'slug' => ['en' => 'school-fees'],
            'is_active' => true,
        ]);

        Sanctum::actingAs($staff);

        $response = $this->postJson('/api/v1/blog-posts', [
            'title' => ['en' => 'Why Exam Fees Matter', 'fr' => 'Pourquoi les frais d examen comptent'],
            'excerpt' => ['en' => 'Exam fees can decide whether a child progresses.'],
            'body' => ['en' => str_repeat('Exam support keeps opportunity open. ', 20)],
            'blog_category_id' => $category->id,
            'tag_ids' => [$tag->id],
            'status' => 'review',
            'is_featured' => true,
            'featured_image_path' => '/images/exam-support-day.jpg',
            'media' => [
                [
                    'url' => '/images/classroom-reading-circle.jpg',
                    'position' => 1,
                    'layout' => 'inset',
                    'caption' => ['en' => 'A reading circle during school support.'],
                ],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.status', 'review')
            ->assertJsonPath('data.slug.en', 'why-exam-fees-matter')
            ->assertJsonPath('data.category.id', $category->id)
            ->assertJsonPath('data.current_featured_image_alt', 'Why Exam Fees Matter')
            ->assertJsonPath('data.current_media.0.alt', 'Classroom Reading Circle');

        $uuid = $response->json('data.uuid');

        $this->patchJson("/api/v1/blog-posts/{$uuid}/status", [
            'status' => 'published',
        ])->assertOk()
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.publisher.id', $staff->id);

        $this->getJson('/api/v1/public/blog-posts/why-exam-fees-matter')
            ->assertOk()
            ->assertJsonPath('data.current_title', 'Why Exam Fees Matter')
            ->assertJsonPath('data.current_media.0.layout', 'inset');
    }

    public function test_global_search_respects_blog_post_permission(): void
    {
        BlogPost::create([
            'author_id' => $this->user()->id,
            'title' => ['en' => 'Community Mentorship Update'],
            'slug' => ['en' => 'community-mentorship-update'],
            'excerpt' => ['en' => 'Mentorship and encouragement in rural communities.'],
            'body' => ['en' => 'Children need encouragement as well as practical support.'],
            'status' => BlogPost::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        Sanctum::actingAs($this->user());

        $this->getJson('/api/v1/global-search?q=Mentorship')
            ->assertOk()
            ->assertJsonMissing(['resource' => 'blog_posts']);

        Sanctum::actingAs($this->user(['blog_posts.view']));

        $this->getJson('/api/v1/global-search?q=Mentorship')
            ->assertOk()
            ->assertJsonFragment(['resource' => 'blog_posts']);
    }

    public function test_staff_can_upload_scanned_blog_media_with_permissions(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->user(['blog_posts.create']));

        $this->post('/api/v1/blog-media', [
            'media' => [UploadedFile::fake()->createWithContent('school-reading-circle.png', $this->smallPng())],
        ], ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('data.media.0.type', 'image')
            ->assertJsonPath('data.media.0.title.en', 'School Reading Circle')
            ->assertJsonPath('data.media.0.alt.en', 'School Reading Circle');

        $this->post('/api/v1/blog-media', [
            'media' => [UploadedFile::fake()->create('dump.sql', 4, 'text/plain')],
        ], ['Accept' => 'application/json'])->assertStatus(422);
    }

    private function user(array $permissions = []): User
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $user = User::create([
            'name' => 'Blog Tester '.Str::random(6),
            'email' => Str::random(8).'@example.org',
            'password' => 'secret-password',
            'preferred_locale' => 'en',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user->givePermissionTo($permissions);

        return $user;
    }

    private function smallPng(): string
    {
        return base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
            true,
        );
    }
}
