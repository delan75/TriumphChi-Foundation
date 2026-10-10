import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowRight, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Locale } from '../../lib/i18n';
import { apiGlobalSearch, type GlobalSearchGroup, type GlobalSearchResult } from '../../lib/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface GlobalSearchPanelProps {
  locale: Locale;
  title: string;
  description: string;
  placeholder: string;
  helperText: string;
  emptyText: string;
  shortQueryText: string;
  permissionsHint: string;
  visibleScopesLabel: string;
  scopeLabels: string[];
  openWorkspaceLabel: string;
  clearLabel: string;
  resultSingular: string;
  resultPlural: string;
  noVisibleScopes: string;
}

interface GroupedResults extends GlobalSearchGroup {
  items: GlobalSearchResult[];
}

export function GlobalSearchPanel({
  locale,
  title,
  description,
  placeholder,
  helperText,
  emptyText,
  shortQueryText,
  permissionsHint,
  visibleScopesLabel,
  scopeLabels,
  openWorkspaceLabel,
  clearLabel,
  resultSingular,
  resultPlural,
  noVisibleScopes,
}: GlobalSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 220);
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const searchQuery = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => apiGlobalSearch(debouncedQuery, 8),
    enabled: debouncedQuery.length >= 2,
    staleTime: 15_000,
  });

  useClickAway(panelRef, () => setIsOpen(false));

  const groupedResults = useMemo<GroupedResults[]>(() => {
    const groups = searchQuery.data?.groups ?? [];
    const results = searchQuery.data?.results ?? [];

    return groups.map((group) => ({
      ...group,
      items: results.filter((result) => result.resource === group.key),
    }));
  }, [searchQuery.data]);

  const showShortQuery = isOpen && debouncedQuery.length > 0 && debouncedQuery.length < 2;
  const showEmptyState =
    isOpen &&
    debouncedQuery.length >= 2 &&
    !searchQuery.isLoading &&
    (searchQuery.data?.results.length ?? 0) === 0;

  function handleSelect(result: GlobalSearchResult) {
    const params = new URLSearchParams();

    if (debouncedQuery) {
      params.set('search', debouncedQuery);
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';
    navigate(`/${locale}${result.module_path}${suffix}`);
    setIsOpen(false);
  }

  return (
    <div ref={panelRef} className="rounded-md border border-ink-100 bg-white shadow-xs">
      <div className="border-b border-ink-100 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>
          </div>
          <div className="rounded-md bg-ink-50 px-3 py-2 text-xs font-medium text-ink-500">{permissionsHint}</div>
        </div>
      </div>

      <div className="px-5 py-5">
        <label className="sr-only" htmlFor="dashboard-global-search">
          {title}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            id="dashboard-global-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className="focus-ring min-h-14 w-full rounded-md border border-ink-100 bg-ink-50 pl-12 pr-12 text-sm text-ink-900 placeholder:text-ink-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="focus-ring absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-500 transition hover:bg-white hover:text-ink-900"
              aria-label={clearLabel}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-ink-500">{helperText}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-normal text-ink-500">{visibleScopesLabel}</span>
            {(scopeLabels.length > 0 ? scopeLabels : [noVisibleScopes]).map((scope) => (
              <span key={scope} className="inline-flex min-h-7 items-center rounded-md bg-foundation-50 px-2.5 text-xs font-semibold text-foundation-900">
                {scope}
              </span>
            ))}
          </div>
        </div>

        {isOpen ? (
          <div className="mt-4 overflow-hidden rounded-md border border-ink-100 bg-white shadow-xs">
            {searchQuery.isLoading ? (
              <SearchState>
                <Loader2 className="h-4 w-4 animate-spin text-foundation-700" aria-hidden="true" />
                <span>{helperText}</span>
              </SearchState>
            ) : null}

            {showShortQuery ? <SearchState>{shortQueryText}</SearchState> : null}

            {showEmptyState ? <SearchState>{emptyText}</SearchState> : null}

            {!searchQuery.isLoading && !showShortQuery && !showEmptyState ? (
              <div className="divide-y divide-ink-100">
                {groupedResults.map((group) => (
                  <section key={group.key}>
                    <header className="flex items-center justify-between gap-3 bg-ink-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{group.label}</p>
                        <p className="text-xs text-ink-500">{group.count} {group.count === 1 ? resultSingular : resultPlural}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/${locale}${group.module_path}`)}
                        className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-semibold text-foundation-700 transition hover:bg-white hover:text-foundation-900"
                      >
                        {openWorkspaceLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </header>
                    <div className="divide-y divide-ink-100">
                      {group.items.map((result) => (
                        <button
                          key={`${result.resource}-${result.id}`}
                          type="button"
                          onClick={() => handleSelect(result)}
                          className="focus-ring flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-foundation-50"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-ink-900">{result.title}</p>
                              {result.reference ? (
                                <span className="rounded-md bg-ink-50 px-2 py-1 text-[11px] font-semibold text-ink-500">
                                  {result.reference}
                                </span>
                              ) : null}
                            </div>
                            {result.subtitle ? <p className="mt-1 text-sm leading-6 text-ink-500">{result.subtitle}</p> : null}
                          </div>
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SearchState({ children }: { children: ReactNode }) {
  return <div className="flex min-h-20 items-center gap-3 px-4 py-4 text-sm text-ink-500">{children}</div>;
}

function useClickAway(ref: React.RefObject<HTMLElement | null>, onAway: () => void) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      onAway();
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, [onAway, ref]);
}
