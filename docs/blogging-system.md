# Blogging System Implementation Guide

## Purpose

The blog is the foundation's public storytelling and education-insight surface. It should publish field notes, program reflections, education support stories, community updates, and future article/news content without exposing private beneficiary records.

The staff side is an editorial workspace, not a generic CRUD page. Staff should be able to draft, review, publish, archive, categorize, tag, and place media inside articles through PBAC-protected APIs.

## Domains

### Public Reading

Public visitors see only published posts where `published_at <= now()`.

The public experience uses:

- A featured article treatment on `/en/blog` and `/fr/blog`
- Category filters and search
- SEO metadata and article schema
- A dedicated article route at `/en/blog/{slug}` and `/fr/blog/{slug}`
- Ordered article media rows placed between paragraphs
- Safe text rendering rather than raw HTML injection

### Staff Editorial Workspace

Staff use `/en/staff/blog` or `/fr/staff/blog`.

The workspace includes:

- Editorial summary cards
- Post filters
- Responsive records table/cards
- Detail preview panel
- Bilingual editor
- Moderation queue
- Category and tag management
- Multi-file media upload with scanning

## Data Model

### `blog_posts`

Core article entity.

Important fields:

- `uuid`: public route key for staff APIs
- `reference`: opaque human support reference, e.g. `BLOG-2267...`
- `title`, `slug`, `excerpt`, `body`: localized JSON, currently `en` and `fr`
- `status`: `draft`, `review`, `published`, `archived`
- `is_featured`
- `featured_image_path`
- `featured_image_alt`: localized JSON
- `seo_title`, `seo_description`: localized JSON
- `metadata.media`: ordered article media rows
- `author_id`
- `published_by`
- `published_at`, `archived_at`, `deleted_at`

### Media Rows

Article media is currently stored in `blog_posts.metadata.media` to avoid premature schema complexity.

Each row:

```json
{
  "type": "image",
  "url": "/storage/blog-media/2026/07/example.webp",
  "title": { "en": "School Reading Circle", "fr": "School Reading Circle" },
  "alt": { "en": "School Reading Circle", "fr": "School Reading Circle" },
  "caption": { "en": "Children reading together.", "fr": null },
  "credit": null,
  "position": 2,
  "layout": "full"
}
```

Supported layouts:

- `full`
- `inset`
- `side`

Supported media types:

- `image`
- `video`

## Security

All staff endpoints are authenticated and PBAC-controlled. Access is permission-based, not role-only.

Permissions:

- `blog_posts.view`
- `blog_posts.create`
- `blog_posts.update`
- `blog_posts.publish`
- `blog_posts.delete`
- `blog_categories.manage`
- `blog_tags.manage`

Media upload requires either:

- `blog_posts.create`
- `blog_posts.update`

Uploaded media is scanned by `FileSecurityScanner::scanMedia()`.

Allowed media extensions:

- `jpg`
- `jpeg`
- `png`
- `webp`
- `svg`
- `mp4`
- `webm`
- `mov`

Blocked examples:

- `.exe`
- `.sql`
- `.php`
- `.js`
- shell/script extensions
- suspicious double extensions
- unsafe SVG content
- executable signatures

Frontend selection also blocks obvious unsafe filenames, but backend scanning is the authority.

## API Contract

### Public

- `GET /api/v1/public/blog/options`
- `GET /api/v1/public/blog-posts`
- `GET /api/v1/public/blog-posts/{slug}`

### Staff

- `GET /api/v1/blog/options`
- `GET /api/v1/blog-posts`
- `POST /api/v1/blog-posts`
- `GET /api/v1/blog-posts/{uuid}`
- `PUT /api/v1/blog-posts/{uuid}`
- `PATCH /api/v1/blog-posts/{uuid}/status`
- `DELETE /api/v1/blog-posts/{uuid}`
- `POST /api/v1/blog-media`
- `GET /api/v1/blog-categories`
- `POST /api/v1/blog-categories`
- `PUT /api/v1/blog-categories/{uuid}`
- `DELETE /api/v1/blog-categories/{uuid}`
- `GET /api/v1/blog-tags`
- `POST /api/v1/blog-tags`
- `PUT /api/v1/blog-tags/{uuid}`
- `DELETE /api/v1/blog-tags/{uuid}`

## Editorial Lifecycle

1. Draft created
2. Media uploaded and placed
3. Post moved to review
4. Authorized publisher reviews content
5. Post published
6. Public API exposes the article
7. Post can later be archived without hard deletion

## SEO Requirements

Each public article should provide:

- Localized title
- Localized slug
- Meta description
- Featured image
- Image alt text
- Article JSON-LD
- Breadcrumb JSON-LD
- `published_at` and `updated_at`
- Category and tags where available

No public image should be rendered without alt text. The editor generates alt text from uploaded filenames and the backend applies a final fallback from title or filename.

## Future Growth

The current `metadata.media` approach is intentionally lightweight. If the system later needs reusable media libraries, transcoding, video thumbnails, advanced credits, or per-media audit history, promote article media into a first-class `blog_media` table.

Future additions should keep the same boundaries:

- Public readers only consume published content
- Staff actions remain PBAC-protected
- Media scanning stays backend authoritative
- Blog content never exposes private beneficiary data
