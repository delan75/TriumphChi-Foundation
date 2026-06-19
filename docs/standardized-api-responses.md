# Standardized API Responses

All API controllers use a standardized response format through `ApiResponseTrait`.

## Response Format

**Success:**
```json
{"success": true, "message": "...", "data": {...}}
```

**Error:**
```json
{"success": false, "message": "...", "errors": {...}}
```

**Paginated:**
```json
{"success": true, "message": "...", "data": [...], "meta": {...}, "links": {...}}
```

## Available Methods

**Basic:** `success()`, `error()`
**CRUD:** `created()`, `updated()`, `deleted()`
**Errors:** `notFound()`, `unauthorized()`, `forbidden()`, `validationError()`, `serverError()`
**Pagination:** `paginated()`

## Usage

```php
public function index()
{
    $items = Item::paginate(15);
    return $this->paginated($items);
}

public function indexWithResource()
{
    $items = Item::paginate(15);
    return $this->paginated($items, 'Items retrieved', ItemResource::class);
}

public function store(Request $request)
{
    $item = Item::create($request->validated());
    return $this->created($item, 'Item created');
}

public function show(Item $item)
{
    return $this->success($item, 'Item retrieved');
}
```

## CORS Configuration

**Backend:** `config/cors.php`
- `allowed_origins`: `['http://localhost:5173']`
- `supports_credentials`: `true`

**Frontend:**
- Public endpoints: `credentials: 'omit'`
- Authenticated endpoints: `credentials: 'include'`

## Notes

- All controllers have `ApiResponseTrait`
- Frontend `api.ts` extracts `data` field
- Public endpoints use `apiPublicGet()`
- Authenticated endpoints use `apiGet()`
