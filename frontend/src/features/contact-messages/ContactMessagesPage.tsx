import { RefreshCcw } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPanel } from '../../components/staff/DashboardPanel';
import { PageHeader } from '../../components/ui/PageHeader';
import { cn } from '../../components/ui/cn';
import { readStoredAuthUser } from '../../lib/auth';
import type { ContactMessageListParams } from '../../lib/api';
import { isLocale } from '../../lib/i18n';
import { ContactMessageDetailPanel } from './components/ContactMessageDetailPanel';
import { ContactMessageFilters } from './components/ContactMessageFilters';
import { ContactMessageRecords } from './components/ContactMessageRecords';
import { ContactMessageSummaryCards } from './components/ContactMessageSummaryCards';
import { contactMessagesContent, type ContactMessagesCopy } from './contactMessagesContent';
import {
  useArchiveContactMessage,
  useAssignContactMessage,
  useContactAssignees,
  useContactMessage,
  useContactMessages,
  useForwardContactMessage,
  useUpdateContactMessage,
} from './useContactMessages';

export function ContactMessagesPage() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const copy = contactMessagesContent[activeLocale];
  const user = readStoredAuthUser();
  const canViewMessages = user?.permissions?.includes('contact_messages.view') ?? false;
  const canUpdateMessages = user?.permissions?.includes('contact_messages.update') ?? false;
  const [filters, setFilters] = useState<ContactMessageListParams>({
    page: 1,
    per_page: 12,
    sort: 'created_at',
    direction: 'desc',
  });
  const [selectedMessageUuid, setSelectedMessageUuid] = useState<string | null>(null);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);

  const messagesQuery = useContactMessages(filters, canViewMessages);
  const messageQuery = useContactMessage(selectedMessageUuid, canViewMessages && Boolean(selectedMessageUuid));
  const assigneesQuery = useContactAssignees(canUpdateMessages);
  const assignMessage = useAssignContactMessage();
  const updateMessage = useUpdateContactMessage();
  const forwardMessage = useForwardContactMessage();
  const archiveMessage = useArchiveContactMessage();

  const messages = messagesQuery.data?.data ?? [];
  const pagination = messagesQuery.data?.meta;
  const selectedMessage = messageQuery.data ?? null;
  const isWorking = assignMessage.isPending || updateMessage.isPending || forwardMessage.isPending || archiveMessage.isPending;

  const pageLabel = useMemo(() => {
    if (!pagination) {
      return '';
    }

    return `${pagination.current_page} / ${pagination.last_page}`;
  }, [pagination]);

  const openMessage = useCallback((uuid: string) => {
    setSelectedMessageUuid(uuid);

    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 1279px)').matches) {
      return;
    }

    window.setTimeout(() => {
      detailPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);
  }, []);

  if (!canViewMessages) {
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
          <button
            type="button"
            onClick={() => messagesQuery.refetch()}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-bold text-white transition hover:bg-foundation-900"
          >
            <RefreshCcw className={cn('h-4 w-4', messagesQuery.isFetching ? 'animate-spin' : '')} aria-hidden="true" />
            {copy.refresh}
          </button>
        }
      />

      <ContactMessageSummaryCards summary={messagesQuery.data?.summary} copy={copy} />

      <ContactMessageFilters
        copy={copy}
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setSelectedMessageUuid(null);
        }}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <DashboardPanel
          title={copy.tableTitle}
          description={copy.tableDescription}
          className="min-w-0"
          action={pagination ? (
            <PaginationControls
              copy={copy}
              pageLabel={pageLabel}
              canPrevious={Boolean(messagesQuery.data?.links.prev)}
              canNext={Boolean(messagesQuery.data?.links.next)}
              onPrevious={() => setFilters((current) => ({ ...current, page: Math.max((current.page ?? 1) - 1, 1) }))}
              onNext={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            />
          ) : null}
          bodyClassName="min-w-0 p-4"
        >
          {messagesQuery.isError ? (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {messagesQuery.error instanceof Error ? messagesQuery.error.message : copy.empty}
            </div>
          ) : (
            <ContactMessageRecords
              copy={copy}
              locale={activeLocale}
              messages={messages}
              isLoading={messagesQuery.isLoading}
              onOpen={openMessage}
            />
          )}
        </DashboardPanel>

        <div ref={detailPanelRef} className="min-w-0 scroll-mt-24">
          <ContactMessageDetailPanel
            copy={copy}
            locale={activeLocale}
            message={selectedMessage}
            assignees={assigneesQuery.data ?? []}
            isLoading={messageQuery.isLoading}
            isWorking={isWorking}
            onAssign={async (uuid, assignedTo) => {
              await assignMessage.mutateAsync({ uuid, assignedTo });
            }}
            onUpdate={async (uuid, status, staffNotes) => {
              await updateMessage.mutateAsync({ uuid, status, staff_notes: staffNotes });
            }}
            onForward={async (uuid, toEmail, note, markAsReplied) => {
              await forwardMessage.mutateAsync({ uuid, to_email: toEmail, note, mark_as_replied: markAsReplied });
            }}
            onArchive={async (uuid) => {
              await archiveMessage.mutateAsync(uuid);
              setSelectedMessageUuid(null);
            }}
            onClose={() => setSelectedMessageUuid(null)}
          />
        </div>
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
  copy: ContactMessagesCopy;
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
        {copy.previous}
      </button>
      <span className="min-h-10 rounded-md bg-ink-50 px-3 py-2 text-sm font-bold text-ink-700">{pageLabel}</span>
      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="focus-ring min-h-10 rounded-md border border-ink-200 px-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {copy.next}
      </button>
      <span className="sr-only">{copy.tableTitle}</span>
    </div>
  );
}
