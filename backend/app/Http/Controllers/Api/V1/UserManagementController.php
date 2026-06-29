<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListManagedUsersRequest;
use App\Http\Requests\StoreManagedUserRequest;
use App\Http\Requests\TransitionManagedUserStatusRequest;
use App\Http\Requests\UpdateManagedUserAccessRequest;
use App\Http\Requests\UpdateManagedUserRequest;
use App\Http\Resources\ManagedUserResource;
use App\Models\User;
use App\Services\AuthAuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function __construct(private readonly AuthAuditLogger $auditLogger)
    {
    }

    public function index(ListManagedUsersRequest $request)
    {
        $filters = $request->validated();
        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';

        $users = $this->filteredQuery($filters)
            ->with(['profile', 'roles', 'permissions'])
            ->orderBy($sort, $direction)
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return ManagedUserResource::collection($users)
            ->additional([
                'summary' => $this->summaryFor($this->filteredQuery($filters)),
                'filters' => array_filter($filters, fn ($value) => $value !== null && $value !== ''),
            ]);
    }

    public function show(User $user): ManagedUserResource
    {
        abort_unless(request()->user()?->can('users.view'), 403);

        return ManagedUserResource::make($user->load([
            'profile',
            'roles',
            'permissions',
            'authProviders',
            'tokens',
            'auditLogs' => fn ($query) => $query->limit(30),
        ]));
    }

    public function store(StoreManagedUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data, $request): User {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'employee_number' => $data['employee_number'] ?? null,
                'password' => Str::random(64),
                'preferred_locale' => $data['preferred_locale'] ?? app()->getLocale(),
                'status' => $data['status'] ?? User::STATUS_INVITED,
                'registered_via' => 'staff_invite',
                'registration_source' => 'staff_user_management',
            ]);

            $user->authProviders()->firstOrCreate(
                ['provider' => 'local'],
                ['linked_at' => now()],
            );

            $this->syncProfile($user, $data['profile'] ?? []);
            $this->syncAccess($user, $data['roles'] ?? [], $data['direct_permissions'] ?? []);

            $this->auditLogger->log($request->user(), 'managed_user_created', $request, $user, [
                'target_user_id' => $user->id,
                'target_user_uuid' => $user->uuid,
                'status' => $user->status,
                'roles' => $data['roles'] ?? [],
                'direct_permissions' => $data['direct_permissions'] ?? [],
            ]);

            return $user;
        });

        return $this->created(
            ManagedUserResource::make($user->fresh()->load(['profile', 'roles', 'permissions', 'authProviders'])),
            __('api.users.created'),
        );
    }

    public function update(UpdateManagedUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request, $user): void {
            $user->forceFill(collect($data)->only([
                'name',
                'email',
                'phone',
                'employee_number',
                'preferred_locale',
            ])->all())->save();

            if (array_key_exists('profile', $data)) {
                $this->syncProfile($user, $data['profile'] ?? []);
            }

            $this->auditLogger->log($request->user(), 'managed_user_updated', $request, $user, [
                'target_user_id' => $user->id,
                'target_user_uuid' => $user->uuid,
                'fields' => array_keys($data),
            ]);
        });

        return $this->success(
            ManagedUserResource::make($user->fresh()->load(['profile', 'roles', 'permissions', 'authProviders'])),
            __('api.users.updated'),
        );
    }

    public function updateAccess(UpdateManagedUserAccessRequest $request, User $user): JsonResponse
    {
        $this->ensureNotSelf($request, $user);
        $data = $request->validated();

        DB::transaction(function () use ($data, $request, $user): void {
            $this->syncAccess($user, $data['roles'], $data['direct_permissions'] ?? []);

            $this->auditLogger->log($request->user(), 'managed_user_access_updated', $request, $user, [
                'target_user_id' => $user->id,
                'target_user_uuid' => $user->uuid,
                'roles' => $data['roles'],
                'direct_permissions' => $data['direct_permissions'] ?? [],
            ]);
        });

        return $this->success(
            ManagedUserResource::make($user->fresh()->load(['profile', 'roles', 'permissions', 'authProviders', 'tokens'])),
            __('api.users.access_updated'),
        );
    }

    public function activate(TransitionManagedUserStatusRequest $request, User $user): JsonResponse
    {
        return $this->transitionStatus($request, $user, User::STATUS_ACTIVE, 'managed_user_activated', __('api.users.activated'));
    }

    public function suspend(TransitionManagedUserStatusRequest $request, User $user): JsonResponse
    {
        $this->ensureNotSelf($request, $user);

        return $this->transitionStatus($request, $user, User::STATUS_SUSPENDED, 'managed_user_suspended', __('api.users.suspended'));
    }

    public function archive(TransitionManagedUserStatusRequest $request, User $user): JsonResponse
    {
        $this->ensureNotSelf($request, $user);

        return $this->transitionStatus($request, $user, User::STATUS_ARCHIVED, 'managed_user_archived', __('api.users.archived'));
    }

    public function terminateSessions(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()?->can('users.sessions.manage'), 403);
        $this->ensureNotSelf($request, $user);

        $deleted = $user->tokens()->delete();

        $this->auditLogger->log($request->user(), 'managed_user_sessions_terminated', $request, $user, [
            'target_user_id' => $user->id,
            'target_user_uuid' => $user->uuid,
            'tokens_deleted' => $deleted,
        ]);

        return $this->success(
            ManagedUserResource::make($user->fresh()->load(['profile', 'roles', 'permissions', 'authProviders', 'tokens'])),
            __('api.users.sessions_terminated'),
        );
    }

    public function accessOptions(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('users.view'), 403);

        $roles = Role::query()
            ->with('permissions:id,name,group')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'name' => $role->name,
                'label' => $role->label ?: str($role->name)->replace('_', ' ')->title()->toString(),
                'permissions' => $role->permissions->pluck('name')->sort()->values(),
            ])
            ->values();

        $permissions = Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy(fn (Permission $permission) => $permission->group ?: 'other')
            ->map(fn ($grouped, string $group) => [
                'group' => $group,
                'label' => str($group)->replace('_', ' ')->title()->toString(),
                'permissions' => $grouped->map(fn (Permission $permission) => [
                    'name' => $permission->name,
                    'label' => $this->permissionLabel($permission->name),
                ])->values(),
            ])
            ->values();

        return $this->success([
            'roles' => $roles,
            'permission_groups' => $permissions,
            'statuses' => collect($this->userStatuses())->map(fn (string $status) => [
                'value' => $status,
                'label' => __('labels.user_statuses.'.$status),
            ])->values(),
        ], __('api.users.access_options_retrieved'));
    }

    private function filteredQuery(array $filters)
    {
        return User::query()
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['role'] ?? null, fn ($query, string $role) => $query->whereHas('roles', fn ($query) => $query->where('name', $role)))
            ->when($filters['department'] ?? null, fn ($query, string $department) => $query->whereHas('profile', fn ($query) => $query->where('department', $department)))
            ->when($filters['position'] ?? null, fn ($query, string $position) => $query->whereHas('profile', fn ($query) => $query->where('position', $position)))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $search = trim($search);
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('employee_number', 'like', "%{$search}%")
                        ->orWhereHas('roles', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('profile', fn ($query) => $query
                            ->where('department', 'like', "%{$search}%")
                            ->orWhere('position', 'like', "%{$search}%")
                            ->orWhere('office_location', 'like', "%{$search}%"));
                });
            });
    }

    private function summaryFor($query): array
    {
        $statusCounts = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($value) => (int) $value)
            ->all();

        return [
            'total_count' => (int) (clone $query)->count(),
            'status_counts' => $statusCounts,
            'active_count' => (int) (clone $query)->where('status', User::STATUS_ACTIVE)->count(),
            'invited_count' => (int) (clone $query)->where('status', User::STATUS_INVITED)->count(),
            'suspended_count' => (int) (clone $query)->where('status', User::STATUS_SUSPENDED)->count(),
            'locked_count' => (int) (clone $query)->where('status', User::STATUS_LOCKED)->count(),
        ];
    }

    private function syncProfile(User $user, array $profileData): void
    {
        if ($profileData === []) {
            return;
        }

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            collect($profileData)->only([
                'department',
                'position',
                'employment_type',
                'office_location',
                'joined_foundation_at',
                'bio',
                'skills',
                'languages',
                'certifications',
                'emergency_contact_name',
                'emergency_contact_phone',
            ])->all(),
        );
    }

    private function syncAccess(User $user, array $roles, array $directPermissions): void
    {
        $user->syncRoles($roles);
        $user->syncPermissions($directPermissions);
    }

    private function transitionStatus(Request $request, User $user, string $status, string $action, string $message): JsonResponse
    {
        $user->forceFill(['status' => $status])->save();

        if ($status !== User::STATUS_ACTIVE) {
            $user->tokens()->delete();
        }

        $this->auditLogger->log($request->user(), $action, $request, $user, [
            'target_user_id' => $user->id,
            'target_user_uuid' => $user->uuid,
            'status' => $status,
            'note' => $request->input('note'),
        ]);

        return $this->success(
            ManagedUserResource::make($user->fresh()->load(['profile', 'roles', 'permissions', 'authProviders', 'tokens'])),
            $message,
        );
    }

    private function ensureNotSelf(Request $request, User $user): void
    {
        if ($request->user()?->is($user)) {
            abort(422, __('api.users.self_management_blocked'));
        }
    }

    private function permissionLabel(string $permission): string
    {
        $key = "labels.permissions.{$permission}";
        $label = __($key);

        return $label === $key ? str($permission)->replace(['.', '_'], ' ')->title()->toString() : $label;
    }

    private function userStatuses(): array
    {
        return [
            User::STATUS_INVITED,
            User::STATUS_PENDING,
            User::STATUS_ACTIVE,
            User::STATUS_SUSPENDED,
            User::STATUS_LOCKED,
            User::STATUS_ARCHIVED,
        ];
    }
}
