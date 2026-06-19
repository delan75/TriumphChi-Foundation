<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiResponseTrait
{
    /**
     * Return a successful JSON response.
     *
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $statusCode
     * @return JsonResponse
     */
    protected function success($data = null, string $message = 'Success', int $statusCode = Response::HTTP_OK): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Return an error JSON response.
     *
     * @param  string  $message
     * @param  int  $statusCode
     * @param  array|null  $errors
     * @return JsonResponse
     */
    protected function error(string $message = 'An error occurred', int $statusCode = Response::HTTP_BAD_REQUEST, ?array $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a JSON response for created resource.
     *
     * @param  mixed  $data
     * @param  string  $message
     * @return JsonResponse
     */
    protected function created($data = null, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->success($data, $message, Response::HTTP_CREATED);
    }

    /**
     * Return a JSON response for updated resource.
     *
     * @param  mixed  $data
     * @param  string  $message
     * @return JsonResponse
     */
    protected function updated($data = null, string $message = 'Resource updated successfully'): JsonResponse
    {
        return $this->success($data, $message);
    }

    /**
     * Return a JSON response for deleted resource.
     *
     * @param  string  $message
     * @return JsonResponse
     */
    protected function deleted(string $message = 'Resource deleted successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], Response::HTTP_OK);
    }

    /**
     * Return a JSON response for not found.
     *
     * @param  string  $message
     * @return JsonResponse
     */
    protected function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->error($message, Response::HTTP_NOT_FOUND);
    }

    /**
     * Return a JSON response for unauthorized access.
     *
     * @param  string  $message
     * @return JsonResponse
     */
    protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->error($message, Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Return a JSON response for forbidden access.
     *
     * @param  string  $message
     * @return JsonResponse
     */
    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->error($message, Response::HTTP_FORBIDDEN);
    }

    /**
     * Return a JSON response for validation errors.
     *
     * @param  array  $errors
     * @param  string  $message
     * @return JsonResponse
     */
    protected function validationError(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->error($message, Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }

    /**
     * Return a JSON response for internal server error.
     *
     * @param  string  $message
     * @param  array|null  $errors
     * @return JsonResponse
     */
    protected function serverError(string $message = 'Internal server error', ?array $errors = null): JsonResponse
    {
        return $this->error($message, Response::HTTP_INTERNAL_SERVER_ERROR, $errors);
    }

    protected function paginated($paginator, string $message = 'Data retrieved successfully', ?string $resourceClass = null): JsonResponse
    {
        $items = $resourceClass
            ? $resourceClass::collection($paginator)->resolve()
            : $paginator->items();

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ]);
    }
}
