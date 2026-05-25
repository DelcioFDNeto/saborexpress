<?php

namespace App\Repositories\AuditEvents;

use App\Models\AuditEvent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentAuditEventRepository implements AuditEventRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return AuditEvent::query()
            ->with('user')
            ->when(isset($filters['event']), fn ($query) => $query->where('event', $filters['event']))
            ->when(isset($filters['user_id']), fn ($query) => $query->where('user_id', $filters['user_id']))
            ->when(isset($filters['auditable_type']), fn ($query) => $query->where('auditable_type', $filters['auditable_type']))
            ->when(isset($filters['auditable_id']), fn ($query) => $query->where('auditable_id', $filters['auditable_id']))
            ->when(isset($filters['date_from']), fn ($query) => $query->where('created_at', '>=', $filters['date_from']))
            ->when(isset($filters['date_to']), fn ($query) => $query->where('created_at', '<=', $filters['date_to']))
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): AuditEvent
    {
        return AuditEvent::create($data);
    }

    public function loadDetails(AuditEvent $auditEvent): AuditEvent
    {
        return $auditEvent->load('user');
    }
}
