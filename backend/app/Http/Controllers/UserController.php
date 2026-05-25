<?php

namespace App\Http\Controllers;

use App\Actions\Audit\RecordAuditEventAction;
use App\Enums\AuditEventType;
use App\Http\Requests\Users\ChangeUserPasswordRequest;
use App\Http\Requests\Users\ListUsersRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Repositories\Users\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class UserController extends Controller
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly RecordAuditEventAction $recordAuditEvent,
    ) {}

    public function index(ListUsersRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 15);

        return UserResource::collection($this->users->paginate($validated, $perPage));
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->users->create($request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::UserCreated, $user);

        return (new UserResource($user))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user = $this->users->update($user, $request->validated());
        $this->recordAuditEvent->execute($request->user(), AuditEventType::UserUpdated, $user);

        return new UserResource($user);
    }

    public function changePassword(ChangeUserPasswordRequest $request, User $user)
    {
        $user = $this->users->update($user, [
            'password' => $request->validated('password'),
        ]);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::UserPasswordChanged, $user);

        return new UserResource($user);
    }

    public function activate(Request $request, User $user)
    {
        $user = $this->users->update($user, ['is_active' => true]);
        $this->recordAuditEvent->execute($request->user(), AuditEventType::UserActivated, $user);

        return new UserResource($user);
    }

    public function deactivate(Request $request, User $user)
    {
        if ($user->is(auth()->user())) {
            throw new ConflictHttpException('Authenticated user cannot deactivate itself.');
        }

        $user = $this->users->update($user, ['is_active' => false]);
        $user->tokens()->delete();
        $this->recordAuditEvent->execute($request->user(), AuditEventType::UserDeactivated, $user);

        return new UserResource($user);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->is(auth()->user())) {
            throw new ConflictHttpException('Authenticated user cannot delete itself.');
        }

        $this->recordAuditEvent->execute($request->user(), AuditEventType::UserDeleted, $user, [
            'email' => $user->email,
        ]);
        $this->users->delete($user);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
