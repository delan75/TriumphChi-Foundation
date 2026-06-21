import { Loader2, LogOut, MonitorX, Settings2, Languages } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { staffWorkspaceContent } from '../../content/staffWorkspace';
import { clearAuthSession, readStoredAuthUser } from '../../lib/auth';
import { apiLogout, apiLogoutAll } from '../../lib/api';
import { isLocale } from '../../lib/i18n';

type SessionMode = 'current' | 'all' | null;

export function StaffSettingsPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = staffWorkspaceContent[activeLocale].settings;
  const user = readStoredAuthUser();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<SessionMode>(null);

  async function handleLogout(mode: Exclude<SessionMode, null>) {
    try {
      setBusy(mode);

      if (mode === 'all') {
        await apiLogoutAll();
      } else {
        await apiLogout();
      }
    } catch {
      // Fall through to local cleanup.
    } finally {
      clearAuthSession();
      navigate(`/${activeLocale}/login`, { replace: true });
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPanel title={copy.title} description={copy.description}>
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-foundation-600 text-white">
                <Settings2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink-900">{copy.sessionTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-500">{copy.sessionDescription}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => handleLogout('current')}
                className="focus-ring flex min-h-11 w-full items-center justify-between rounded-md border border-ink-100 px-4 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {busy === 'current' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
                  {copy.logoutCurrent}
                </span>
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => handleLogout('all')}
                className="focus-ring flex min-h-11 w-full items-center justify-between rounded-md border border-ink-100 px-4 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {busy === 'all' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MonitorX className="h-4 w-4" aria-hidden="true" />}
                  {copy.logoutAll}
                </span>
              </button>
            </div>
          </article>

          <article className="rounded-md border border-ink-100 bg-ink-50/60 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                <Languages className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink-900">{copy.workspaceTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-500">{copy.workspaceDescription}</p>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-foundation-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-ink-900">{user?.preferred_locale ?? activeLocale}</p>
              <p className="mt-1 text-sm leading-6 text-ink-500">{copy.localeNote}</p>
            </div>
          </article>
        </div>
      </DashboardPanel>
    </section>
  );
}
