import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock3, Command, Loader2, Search, X } from 'lucide-react';
import type { Locale } from '../../lib/i18n';
import { apiGlobalSearch, type GlobalSearchResult } from '../../lib/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { cn } from '../ui/cn';

interface StaffCommandSearchProps {
  locale: Locale;
  placeholder: string;
  emptyText: string;
  shortQueryText: string;
  recentLabel: string;
  recentEmpty: string;
  openWorkspaceLabel: string;
  clearLabel: string;
  resultLabels: { one: string; many: string };
}

const RECENT_SEARCHES_KEY = 'triumphchi.dashboard.recent-searches';

export function StaffCommandSearch({
  locale,
  placeholder,
  emptyText,
  shortQueryText,
  recentLabel,
  recentEmpty,
  openWorkspaceLabel,
  clearLabel,
  resultLabels,
}: StaffCommandSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches());
  const debouncedQuery = useDebouncedValue(query.trim(), 220);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const searchQuery = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => apiGlobalSearch(debouncedQuery, 10),
    enabled: open && debouncedQuery.length >= 2,
    staleTime: 15_000,
  });

  const groupedResults = useMemo(() => {
    const groups = searchQuery.data?.groups ?? [];
    const results = searchQuery.data?.results ?? [];

    return groups.map((group) => ({
      ...group,
      items: results.filter((result) => result.resource === group.key),
    }));
  }, [searchQuery.data]);

  const flatResults = useMemo(
    () =>
      groupedResults.flatMap((group) =>
        group.items.map((item) => ({
          group,
          item,
        })),
      ),
    [groupedResults],
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  function handleSelect(result: GlobalSearchResult, searchValue: string) {
    persistRecentSearch(searchValue, setRecentSearches);
    setOpen(false);
    setQuery('');

    const params = new URLSearchParams();
    if (searchValue) {
      params.set('search', searchValue);
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';
    navigate(`/${locale}${result.module_path}${suffix}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!flatResults.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % flatResults.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + flatResults.length) % flatResults.length);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const active = flatResults[activeIndex];
      if (active) {
        handleSelect(active.item, debouncedQuery);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring hidden h-11 w-full max-w-2xl items-center gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 text-left text-sm text-ink-500 transition hover:border-foundation-100 hover:bg-white lg:flex"
      >
        <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{placeholder}</span>
        <span className="inline-flex min-h-7 items-center rounded-md border border-ink-100 bg-white px-2 text-xs font-semibold text-ink-500">
          <Command className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          K
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-ink-100 bg-white text-ink-700 transition hover:bg-ink-50 lg:hidden"
        aria-label={placeholder}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-110 bg-ink-900/40 p-4 backdrop-blur-xs sm:p-6">
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="relative mx-auto mt-6 max-w-3xl overflow-hidden rounded-md border border-ink-100 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-4">
              <Search className="h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-11 flex-1 border-0 p-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
                  aria-label={clearLabel}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {searchQuery.isLoading ? (
                <SearchMessage>
                  <Loader2 className="h-4 w-4 animate-spin text-foundation-700" aria-hidden="true" />
                  <span>{placeholder}</span>
                </SearchMessage>
              ) : null}

              {!searchQuery.isLoading && debouncedQuery.length > 0 && debouncedQuery.length < 2 ? (
                <SearchMessage>{shortQueryText}</SearchMessage>
              ) : null}

              {!searchQuery.isLoading && debouncedQuery.length >= 2 && flatResults.length === 0 ? (
                <SearchMessage>{emptyText}</SearchMessage>
              ) : null}

              {!searchQuery.isLoading && debouncedQuery.length === 0 ? (
                <div className="px-4 py-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-ink-500">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    {recentLabel}
                  </div>
                  {recentSearches.length ? (
                    <div className="grid gap-2">
                      {recentSearches.map((recent) => (
                        <button
                          key={recent}
                          type="button"
                          onClick={() => setQuery(recent)}
                          className="focus-ring flex min-h-11 items-center justify-between rounded-md border border-ink-100 bg-ink-50 px-3 text-left text-sm text-ink-700 transition hover:bg-foundation-50 hover:text-foundation-900"
                        >
                          <span className="truncate">{recent}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <SearchMessage>{recentEmpty}</SearchMessage>
                  )}
                </div>
              ) : null}

              {!searchQuery.isLoading && debouncedQuery.length >= 2 && flatResults.length > 0 ? (
                <div className="divide-y divide-ink-100">
                  {groupedResults.map((group) => (
                    <section key={group.key}>
                      <header className="flex items-center justify-between gap-3 bg-ink-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{group.label}</p>
                          <p className="text-xs text-ink-500">
                            {group.count} {group.count === 1 ? resultLabels.one : resultLabels.many}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            navigate(`/${locale}${group.module_path}`);
                          }}
                          className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-semibold text-foundation-700 transition hover:bg-white hover:text-foundation-900"
                        >
                          {openWorkspaceLabel}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </header>
                      <div className="divide-y divide-ink-100">
                        {group.items.map((result) => {
                          const index = flatResults.findIndex((entry) => entry.item.id === result.id && entry.item.resource === result.resource);
                          const isActive = activeIndex === index;

                          return (
                            <button
                              key={`${result.resource}-${result.id}`}
                              type="button"
                              onClick={() => handleSelect(result, debouncedQuery)}
                              className={cn(
                                'focus-ring flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition',
                                isActive ? 'bg-foundation-50' : 'hover:bg-foundation-50',
                              )}
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-ink-900">{result.title}</p>
                                  {result.reference ? (
                                    <span className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-ink-500 shadow-xs">
                                      {result.reference}
                                    </span>
                                  ) : null}
                                </div>
                                {result.subtitle ? <p className="mt-1 text-sm leading-6 text-ink-500">{result.subtitle}</p> : null}
                              </div>
                              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SearchMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-24 items-center gap-3 px-4 py-5 text-sm text-ink-500">{children}</div>;
}

function readRecentSearches(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const payload = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return payload ? (JSON.parse(payload) as string[]) : [];
  } catch {
    return [];
  }
}

function persistRecentSearch(query: string, setRecentSearches: (searches: string[]) => void) {
  if (typeof window === 'undefined' || !query.trim()) {
    return;
  }

  const next = [query.trim(), ...readRecentSearches().filter((item) => item !== query.trim())].slice(0, 6);
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  setRecentSearches(next);
}
