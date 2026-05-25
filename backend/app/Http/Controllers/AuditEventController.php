<?php

namespace App\Http\Controllers;

use App\Http\Requests\Audit\ListAuditEventsRequest;
use App\Http\Resources\AuditEventResource;
use App\Models\AuditEvent;
use App\Repositories\AuditEvents\AuditEventRepositoryInterface;

class AuditEventController extends Controller
{
    public function __construct(
        private readonly AuditEventRepositoryInterface $auditEvents,
    ) {}

    public function index(ListAuditEventsRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);

        return AuditEventResource::collection($this->auditEvents->paginate($validated, $perPage));
    }

    public function show(AuditEvent $auditEvent)
    {
        return new AuditEventResource($this->auditEvents->loadDetails($auditEvent));
    }
}
