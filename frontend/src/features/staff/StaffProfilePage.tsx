import { ShieldCheck, UserRound } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { staffWorkspaceContent } from '../../content/staffWorkspace';
import { readStoredAuthUser } from '../../lib/auth';
import { isLocale } from '../../lib/i18n';

export function StaffProfilePage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = staffWorkspaceContent[activeLocale].profile;
  const user = readStoredAuthUser();
  const lastLogin = formatDateTime(user?.last_login_at, activeLocale);

  return (
    <section className="space-y-6">
      <DashboardPanel
        title={copy.title}
        description={copy.description}
        action={<StatusBadge label={user?.status ?? 'active'} tone="success" />}
      >
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-md border border-ink-100 bg-ink-50/60 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-foundation-600 text-white">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-ink-900">{copy.identityTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-500">{copy.identityDescription}</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <ProfileField label={copy.labels.name} value={user?.name ?? '-'} />
              <ProfileField label={copy.labels.email} value={user?.email ?? '-'} />
              <ProfileField label={copy.labels.phone} value={user?.phone ?? copy.emptyPhone} />
              <ProfileField label={copy.labels.locale} value={user?.preferred_locale ?? activeLocale} />
              <ProfileField label={copy.labels.roles} value={(user?.roles ?? []).join(', ') || '-'} />
              <ProfileField label={copy.labels.permissions} value={String(user?.permissions?.length ?? 0)} />
              <ProfileField label={copy.labels.lastLogin} value={lastLogin} />
              <ProfileField label={copy.labels.status} value={user?.status ?? 'active'} />
            </dl>
          </article>

          <article className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink-900">{copy.labels.permissions}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-500">{copy.accessNote}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(user?.permissions ?? []).length ? (
                (user?.permissions ?? []).slice(0, 12).map((permission) => (
                  <span key={permission} className="inline-flex min-h-8 items-center rounded-md bg-ink-100 px-2.5 text-xs font-semibold text-ink-700">
                    {permission}
                  </span>
                ))
              ) : (
                <p className="text-sm text-ink-500">{copy.noPermissions}</p>
              )}
            </div>
          </article>
        </div>
      </DashboardPanel>
    </section>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white px-4 py-3 shadow-sm">
      <dt className="text-[11px] font-semibold uppercase tracking-normal text-ink-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

function formatDateTime(value: string | null | undefined, locale: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
