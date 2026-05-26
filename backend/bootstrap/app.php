<?php

use App\Http\Middleware\CheckRole;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request, Throwable $e) => $request->is('api/*') || $request->expectsJson()
        );

        $error = function (string $message, string $type, int $status, array $extra = []) {
            return response()->json(array_merge([
                'message' => $message,
                'error' => [
                    'type' => $type,
                    'status' => $status,
                ],
            ], $extra), $status);
        };

        $exceptions->render(function (ValidationException $e, Request $request) use ($error) {
            if (! $request->is('api/*')) {
                return null;
            }

            return $error($e->getMessage(), 'validation_error', 422, [
                'errors' => $e->errors(),
            ]);
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) use ($error) {
            if (! $request->is('api/*')) {
                return null;
            }

            return $error('Unauthenticated.', 'unauthenticated', 401);
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) use ($error) {
            if (! $request->is('api/*')) {
                return null;
            }

            return $error($e->getMessage() ?: 'Forbidden.', 'forbidden', 403);
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e, Request $request) use ($error) {
            if (! $request->is('api/*')) {
                return null;
            }

            return $error('Resource not found.', 'not_found', 404);
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) use ($error) {
            if (! $request->is('api/*')) {
                return null;
            }

            return $error('Method not allowed.', 'method_not_allowed', 405);
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) use ($error) {
            if (! $request->is('api/*')) {
                return null;
            }

            $status = $e->getStatusCode();
            $type = match ($status) {
                400 => 'bad_request',
                401 => 'unauthenticated',
                403 => 'forbidden',
                404 => 'not_found',
                405 => 'method_not_allowed',
                409 => 'conflict',
                422 => 'unprocessable_entity',
                default => 'http_error',
            };

            return $error($e->getMessage() ?: 'Request failed.', $type, $status);
        });

        $exceptions->render(function (Throwable $e, Request $request) use ($error) {
            if (! $request->is('api/*')) {
                return null;
            }

            return $error($e->getMessage() ?: 'Internal server error.', 'internal_server_error', 500, [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => array_slice(explode("\n", $e->getTraceAsString()), 0, 10),
            ]);
        });
    })->create();
