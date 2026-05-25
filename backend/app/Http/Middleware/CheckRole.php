<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (! $request->user()) {
            abort(401, 'Unauthenticated.');
        }

        if (! $request->user()->is_active) {
            abort(403, 'Inactive users cannot access protected resources.');
        }

        if ($roles !== [] && ! in_array($request->user()->role, $roles, true)) {
            abort(403, 'Forbidden. Insufficient permissions.');
        }

        return $next($request);
    }
}
