import { RefreshCcw, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../components/ui/cn';
import { readStoredAuthUser } from '../../lib/auth';
import type { ManagedUserListParams, ManagedUserPayload } from '../../lib/api';
import { isLocale } from '../../lib/i18n';
import { UserDetailPanel } from './components/UserDetailPanel';
import { UserFilters } from './components/UserFilters';
import { UserFormPanel } from './components/UserFormPanel';
import { UserRecords } from './components/UserRecords';
import { UserSummaryCards } from './components/UserSummaryCards';
import { usersContent, type UsersCopy } from './usersContent';
import {
  useCreateManagedUser,
  useManagedUser,
  useManagedUsers,
  useTerminateManagedUserSessions,
  useTransitionManagedUserStatus,
  useUpdateManagedUser,
  useUpdateManagedUserAccess,
  useUserAccessOptions,
} from './useUsers';

export function UsersPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = usersContent[activeLocale];
  const currentUser = readStoredAuthUser();
  const canViewUsers = currentUser?.permissions?.includes('users.view') ?? false;
  const canCreateUsers = currentUser?.permissions?.includes('users.create') ?? false;
  const [filters, setFilters] = useState<ManagedUserListParams>({
    page: 1,
    per_page: 12,
    sort: 'created_at',
    direction: 'desc',
  });
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const usersQuery = useManagedUsers(filters, canViewUsers);
  const userQuery = useManagedUser(selectedUserUuid, canViewUsers && Boolean(selectedUserUuid));
  const accessOptionsQuery = useUserAccessOptions(canViewUsers);
  const createUser = useCreateManagedUser();
  const updateUser = useUpdateManagedUser();
  const updateAccess = useUpdateManagedUserAccess();
  const transitionStatus = useTransitionManagedUserStatus();
  const terminateSessions = useTerminateManagedUserSessions();

  const users = usersQuery.data?.data ?? [];
  const pagination = usersQuery.data?.meta;
  const selectedUser = userQuery.data ?? null;
  const isWorking = createUser.isPending || updateUser.isPending || updateAccess.isPending || transitionStatus.isPending || terminateSessions.isPending;

  const pageLabel = useMemo(() => {
    if (!pagination) {
      return '';
    }

    return `${pagination.current_page} / ${pagination.last_page}`;
  }, [pagination]);

  async function handleCreate(payload: ManagedUserPayload) {
    setMutationError(null);
    try {
      const created = await createUser.mutateAsync(payload);
      setSelectedUserUuid(created.uuid);
      setFormMode(null);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save user.');
    }
  }

  async function handleUpdate(payload: ManagedUserPayload) {
    if (!selectedUser) {
      return;
    }

    setMutationError(null);
    try {
      await updateUser.mutateAsync({ uuid: selectedUser.uuid, payload });
      setFormMode(null);
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Unable to save user.');
    }
  }

  if (!canViewUsers) {
    return (
      <section className="space-y-6">
        <PageHeader title={copy.title} description={copy.description} />
        <DashboardPanel title={copy.accessDeniedTitle}>
          <p className="text-sm leading-6 text-ink-500">{copy.accessDeniedBody}</p>
        </DashboardPanel>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          <div className="flex flex-wrap gap-2">
            {canCreateUsers ? (
              <button
                type="button"
                onClick={() => {
                  setMutationError(null);
                  setFormMode('create');
                }}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                {copy.create}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-ink-200 bg-white px-4 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
            >
              <RefreshCcw className={cn('h-4 w-4', usersQuery.isFetching ? 'animate-spin' : '')} aria-hidden="true" />
              {copy.refresh}
            </button>
          </div>
        }
      />

      <UserSummaryCards summary={usersQuery.data?.summary} copy={copy} />

      <UserFilters
        copy={copy}
        filters={filters}
        accessOptions={accessOptionsQuery.data}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setSelectedUserUuid(null);
        }}
      />

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.38fr)_minmax(420px,0.62fr)]">
        <DashboardPanel
          title={copy.table.title}
          description={copy.table.description}
          className="min-w-0"
          action={pagination ? (
            <PaginationControls
              copy={copy}
              pageLabel={pageLabel}
              canPrevious={Boolean(usersQuery.data?.links.prev)}
              canNext={Boolean(usersQuery.data?.links.next)}
              onPrevious={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 1) - 1, 1) }))}
              onNext={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            />
          ) : null}
          bodyClassName="p-4"
        >
          {usersQuery.isError ? (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {usersQuery.error instanceof Error ? usersQuery.error.message : copy.table.empty}
            </div>
          ) : (
            <UserRecords
              copy={copy}
              locale={activeLocale}
              users={users}
              selectedUuid={selectedUserUuid}
              isLoading={usersQuery.isLoading}
              onOpen={(uuid) => {
                setFormMode(null);
                setMutationError(null);
                setSelectedUserUuid(uuid);
              }}
            />
          )}
        </DashboardPanel>

        {formMode ? (
          <UserFormPanel
            copy={copy}
            mode={formMode}
            user={formMode === 'edit' ? selectedUser : null}
            accessOptions={accessOptionsQuery.data}
            isWorking={isWorking}
            error={mutationError}
            onClose={() => setFormMode(null)}
            onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
          />
        ) : (
          <UserDetailPanel
            copy={copy}
            locale={activeLocale}
            user={selectedUser}
            accessOptions={accessOptionsQuery.data}
            isLoading={userQuery.isLoading}
            isWorking={isWorking}
            error={mutationError}
            onClose={() => setSelectedUserUuid(null)}
            onEdit={() => {
              setMutationError(null);
              setFormMode('edit');
            }}
            onAccessSave={async (uuid, roles, directPermissions) => {
              setMutationError(null);
              try {
                await updateAccess.mutateAsync({ uuid, roles, direct_permissions: directPermissions });
              } catch (error) {
                setMutationError(error instanceof Error ? error.message : 'Unable to update access.');
              }
            }}
            onStatusAction={async (uuid, action) => {
              setMutationError(null);
              try {
                await transitionStatus.mutateAsync({ uuid, action });
              } catch (error) {
                setMutationError(error instanceof Error ? error.message : 'Unable to update status.');
              }
            }}
            onTerminateSessions={async (uuid) => {
              setMutationError(null);
              try {
                await terminateSessions.mutateAsync(uuid);
              } catch (error) {
                setMutationError(error instanceof Error ? error.message : 'Unable to terminate sessions.');
              }
            }}
          />
        )}
      </div>
    </section>
  );
}

function PaginationControls({
  copy,
  pageLabel,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  copy: UsersCopy;
  pageLabel: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={!canPrevious}
        onClick={onPrevious}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.table.previous}
      </button>
      <span className="min-h-10 rounded-md bg-ink-50 px-3 py-2 text-sm font-bold text-ink-700">{pageLabel}</span>
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.table.next}
      </button>
    </div>
  );
}
