<?php

namespace App\Repositories\Users;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return User::query()
            ->when(isset($filters['role']), fn ($query) => $query->where('role', $filters['role']))
            ->when(isset($filters['is_active']), fn ($query) => $query->where('is_active', $this->postgresBoolean($filters['is_active'])))
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $search = '%'.$filters['search'].'%';

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search);
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        $data = $this->normalizeBooleanColumns($data);

        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $data = $this->normalizeBooleanColumns($data);

        $user->update($data);

        return $user->fresh();
    }

    public function delete(User $user): void
    {
        $user->delete();
    }

    private function normalizeBooleanColumns(array $data): array
    {
        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = $this->postgresBoolean($data['is_active']);
        }

        return $data;
    }

    private function postgresBoolean(mixed $value): string
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false';
    }
}
