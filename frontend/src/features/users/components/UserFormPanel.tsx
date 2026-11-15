import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DashboardPanel } from '../../../components/staff/DashboardPanel';
import type { ManagedUserPayload, ManagedUserRecord, UserAccessOptions } from '../../../lib/api';
import type { UsersCopy } from '../usersContent';

interface UserFormPanelProps {
  copy: UsersCopy;
  mode: 'create' | 'edit';
  user?: ManagedUserRecord | null;
  accessOptions?: UserAccessOptions;
  isWorking: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: ManagedUserPayload) => Promise<void>;
}

export function UserFormPanel({
  copy,
  mode,
  user,
  accessOptions,
  isWorking,
  error,
  onClose,
  onSubmit,
}: UserFormPanelProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [employeeNumber, setEmployeeNumber] = useState(user?.employee_number ?? '');
  const [locale, setLocale] = useState(user?.preferred_locale ?? 'en');
  const [department, setDepartment] = useState(user?.profile?.department ?? '');
  const [position, setPosition] = useState(user?.profile?.position ?? '');
  const [employmentType, setEmploymentType] = useState(user?.profile?.employment_type ?? '');
  const [officeLocation, setOfficeLocation] = useState(user?.profile?.office_location ?? '');
  const [bio, setBio] = useState(user?.profile?.bio ?? '');
  const [roles, setRoles] = useState<string[]>(user?.roles.map((role) => role.name) ?? []);
  const [directPermissions, setDirectPermissions] = useState<string[]>(
    user?.direct_permissions ?? [],
  );

  const canAssignAccess = mode === 'create';
  const title = mode === 'create' ? copy.form.title : copy.form.editTitle;
  const payload = useMemo<ManagedUserPayload>(
    () => ({
      name,
      email,
      phone: phone || null,
      employee_number: employeeNumber || null,
      preferred_locale: locale,
      roles: canAssignAccess ? roles : undefined,
      direct_permissions: canAssignAccess ? directPermissions : undefined,
      profile: {
        department: department || null,
        position: position || null,
        employment_type: employmentType || null,
        office_location: officeLocation || null,
        bio: bio || null,
      },
    }),
    [
      bio,
      canAssignAccess,
      department,
      directPermissions,
      email,
      employeeNumber,
      employmentType,
      locale,
      name,
      officeLocation,
      phone,
      position,
      roles,
    ],
  );

  return (
    <DashboardPanel
      title={title}
      action={
        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-200 text-ink-600 transition hover:bg-ink-50"
          aria-label={copy.detail.close}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(payload);
        }}
      >
        {error ? (
          <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field required label={copy.form.name} value={name} onChange={setName} />
          <Field required type="email" label={copy.form.email} value={email} onChange={setEmail} />
          <Field type="tel" label={copy.form.phone} value={phone} onChange={setPhone} />
          <Field
            label={copy.form.employeeNumber}
            value={employeeNumber}
            onChange={setEmployeeNumber}
          />
          <label className="min-w-0">
            <span className="text-xs font-bold uppercase text-ink-500">{copy.form.locale}</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value)}
              className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink-200 px-3 text-sm font-semibold text-ink-800 outline-hidden"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </label>
          <Field label={copy.form.department} value={department} onChange={setDepartment} />
          <Field label={copy.form.position} value={position} onChange={setPosition} />
          <Field
            label={copy.form.employmentType}
            value={employmentType}
            onChange={setEmploymentType}
          />
          <Field
            label={copy.form.officeLocation}
            value={officeLocation}
            onChange={setOfficeLocation}
          />
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase text-ink-500">{copy.form.bio}</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className="focus-ring mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-900 outline-hidden"
          />
        </label>

        {canAssignAccess ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <CheckboxGroup title={copy.form.roles}>
              {(accessOptions?.roles ?? []).map((role) => (
                <Checkbox
                  key={role.name}
                  label={role.label}
                  checked={roles.includes(role.name)}
                  onChange={(checked) =>
                    setRoles((current) =>
                      checked
                        ? [...current, role.name]
                        : current.filter((item) => item !== role.name),
                    )
                  }
                />
              ))}
            </CheckboxGroup>
            <CheckboxGroup title={copy.form.directPermissions}>
              {(accessOptions?.permission_groups ?? [])
                .flatMap((group) => group.permissions)
                .slice(0, 24)
                .map((permission) => (
                  <Checkbox
                    key={permission.name}
                    label={permission.label}
                    checked={directPermissions.includes(permission.name)}
                    onChange={(checked) =>
                      setDirectPermissions((current) =>
                        checked
                          ? [...current, permission.name]
                          : current.filter((item) => item !== permission.name),
                      )
                    }
                  />
                ))}
            </CheckboxGroup>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isWorking || !name || !email}
          className="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isWorking ? copy.saving : copy.save}
        </button>
      </form>
    </DashboardPanel>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="min-w-0">
      <span className="text-xs font-bold uppercase text-ink-500">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-2 min-h-11 w-full rounded-md border border-ink-200 px-3 text-sm text-ink-900 outline-hidden"
      />
    </label>
  );
}

function CheckboxGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-md border border-ink-100 p-4">
      <legend className="px-1 text-sm font-black text-ink-900">{title}</legend>
      <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">{children}</div>
    </fieldset>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 items-center gap-3 rounded-md bg-ink-50 px-3 py-2 text-sm font-semibold text-ink-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded-sm border-ink-300 text-foundation-600"
      />
      <span>{label}</span>
    </label>
  );
}
