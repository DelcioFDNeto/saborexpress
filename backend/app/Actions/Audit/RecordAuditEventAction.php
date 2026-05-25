<?php

namespace App\Actions\Audit;

use App\Enums\AuditEventType;
use App\Models\AuditEvent;
use App\Models\User;
use App\Repositories\AuditEvents\AuditEventRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

class RecordAuditEventAction
{
    public function __construct(
        private readonly AuditEventRepositoryInterface $auditEvents,
    ) {}

    public function execute(?User $actor, AuditEventType $event, ?Model $auditable = null, array $metadata = []): AuditEvent
    {
        return $this->auditEvents->create([
            'user_id' => $actor?->id,
            'event' => $event->value,
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'metadata' => $metadata === [] ? null : $metadata,
        ]);
    }
}
