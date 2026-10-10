import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveLocale, buildLocalizedPath, storeLocalePreference } from '../../lib/localeRecovery';
import { isLocale } from '../../lib/i18n';

export function LocaleRecoveryWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];

    // If already has valid locale, do nothing
    if (firstSegment && isLocale(firstSegment)) {
      return;
    }

    // Resolve locale and build new path
    const { locale, source } = resolveLocale(location.pathname);
    const newPath = buildLocalizedPath(location.pathname, location.search, location.hash, locale);

    // Store preference for future visits
    storeLocalePreference(locale);

    // Track recovery for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'locale_recovery', {
        original_path: location.pathname,
        recovered_path: newPath,
        locale,
        source,
      });
    }

    // Redirect to localized path
    navigate(newPath, { replace: true });
  }, [location, navigate]);

  return null;
}
