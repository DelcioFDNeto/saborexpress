<?php

namespace App\Repositories\AuditEvents;

use App\Models\AuditEvent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AuditEventRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function create(array $data): AuditEvent;

    public function loadDetails(AuditEvent $auditEvent): AuditEvent;
}
