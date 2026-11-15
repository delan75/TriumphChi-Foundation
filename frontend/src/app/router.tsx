import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { PageLoading } from '../components/ui/PageLoading';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { PublicPage } from '../features/public/PublicPage';
import { NotFoundPage } from '../features/errors/NotFoundPage';
import { LocaleRecoveryWrapper } from '../features/errors/LocaleRecoveryWrapper';
import { buildAuthPath, isAuthenticated, resolvePostAuthPath } from '../lib/auth';
import { isLocale } from '../lib/i18n';
import { buildLocalizedPath, resolveLocale, storeLocalePreference } from '../lib/localeRecovery';

// Keep route wrappers eager so locale and authentication checks run before page imports.
const StaffDashboardPage = lazy(() =>
  import('../features/staff/StaffDashboardPage').then((module) => ({
    default: module.StaffDashboardPage,
  })),
);
const StaffProfilePage = lazy(() =>
  import('../features/staff/StaffProfilePage').then((module) => ({
    default: module.StaffProfilePage,
  })),
);
const StaffSettingsPage = lazy(() =>
  import('../features/staff/StaffSettingsPage').then((module) => ({
    default: module.StaffSettingsPage,
  })),
);
const ApplicationsPage = lazy(() =>
  import('../features/applications/ApplicationsPage').then((module) => ({
    default: module.ApplicationsPage,
  })),
);
const BeneficiariesPage = lazy(() =>
  import('../features/beneficiaries/BeneficiariesPage').then((module) => ({
    default: module.BeneficiariesPage,
  })),
);
const ContactMessagesPage = lazy(() =>
  import('../features/contact-messages/ContactMessagesPage').then((module) => ({
    default: module.ContactMessagesPage,
  })),
);
const FundingPage = lazy(() =>
  import('../features/funding/FundingPage').then((module) => ({ default: module.FundingPage })),
);
const ReportsPage = lazy(() =>
  import('../features/reports/ReportsPage').then((module) => ({ default: module.ReportsPage })),
);
const UsersPage = lazy(() =>
  import('../features/users/UsersPage').then((module) => ({ default: module.UsersPage })),
);
const BlogManagementPage = lazy(() =>
  import('../features/blog/BlogManagementPage').then((module) => ({
    default: module.BlogManagementPage,
  })),
);
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('../features/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('../features/auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import('../features/auth/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const OAuthCallbackPage = lazy(() =>
  import('../features/auth/OAuthCallbackPage').then((module) => ({
    default: module.OAuthCallbackPage,
  })),
);
const VerifyAccountPage = lazy(() =>
  import('../features/auth/VerifyAccountPage').then((module) => ({
    default: module.VerifyAccountPage,
  })),
);
const PaypalDonationReturnPage = lazy(() =>
  import('../features/public/donate/PaypalDonationReturnPage').then((module) => ({
    default: module.PaypalDonationReturnPage,
  })),
);
const BlogArticlePage = lazy(() =>
  import('../features/public/blog/BlogArticlePage').then((module) => ({
    default: module.BlogArticlePage,
  })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLocaleRedirect />,
  },
  {
    path: '/:locale',
    element: <LocaleRouteGate />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <PublicPage /> },
          {
            path: 'staff',
            element: <ProtectedStaffOutlet />,
            children: [
              { index: true, element: <StaffDashboardPage /> },
              { path: 'profile', element: <StaffProfilePage /> },
              { path: 'settings', element: <StaffSettingsPage /> },
              { path: 'applications', element: <ApplicationsPage /> },
              { path: 'beneficiaries', element: <BeneficiariesPage /> },
              { path: 'funding', element: <FundingPage /> },
              { path: 'contacts', element: <ContactMessagesPage /> },
              { path: 'blog', element: <BlogManagementPage /> },
              { path: 'reports', element: <ReportsPage /> },
              { path: 'users', element: <UsersPage /> },
            ],
          },
          {
            path: 'donate/paypal/return',
            element: <PaypalDonationReturnPageWrapper mode="return" />,
          },
          {
            path: 'donate/paypal/cancel',
            element: <PaypalDonationReturnPageWrapper mode="cancel" />,
          },
          { path: 'blog/:articleSlug', element: <BlogArticlePageWrapper /> },
          { path: ':pageSlug', element: <PublicPage /> },
          { path: '*', element: <NotFoundPageWrapper /> },
        ],
      },
      {
        path: 'login',
        element: <LoginPageWrapper />,
      },
      {
        path: 'register',
        element: <RegisterPageWrapper />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPageWrapper />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPageWrapper />,
      },
      {
        path: 'verify-account',
        element: <VerifyAccountPageWrapper />,
      },
      {
        path: 'oauth/callback',
        element: <OAuthCallbackPageWrapper />,
      },
    ],
  },
  {
    path: '*',
    element: <LocaleRecoveryWrapper />,
  },
]);

function RootLocaleRedirect() {
  const location = useLocation();
  const { locale } = resolveLocale(location.pathname);

  useEffect(() => {
    storeLocalePreference(locale);
  }, [locale]);

  return <Navigate to={`/${locale}${location.search}${location.hash}`} replace />;
}

function LocaleRouteGate() {
  const { locale } = useParams();
  const location = useLocation();
  const activeLocale = isLocale(locale) ? locale : null;

  useEffect(() => {
    if (activeLocale) {
      storeLocalePreference(activeLocale);
    }
  }, [activeLocale]);

  if (!activeLocale) {
    const recovery = resolveLocale(location.pathname);
    const localizedPath = buildLocalizedPath(
      location.pathname,
      location.search,
      location.hash,
      recovery.locale,
    );

    return <Navigate to={localizedPath} replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
    </>
  );
}

function LoginPageWrapper() {
  const { locale = 'en' } = useParams();
  const location = useLocation();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  if (isAuthenticated()) {
    return <Navigate to={resolvePostAuthPath(activeLocale, redirectTo)} replace />;
  }

  return <LoginPage locale={activeLocale} redirectTo={redirectTo} />;
}

function ProtectedStaffOutlet() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const location = useLocation();

  if (!isAuthenticated()) {
    const requestedPath = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to={buildAuthPath(activeLocale, 'login', requestedPath)} replace />;
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Outlet />
    </Suspense>
  );
}

function RegisterPageWrapper() {
  const { locale = 'en' } = useParams();
  const location = useLocation();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  if (isAuthenticated()) {
    return <Navigate to={resolvePostAuthPath(activeLocale, redirectTo)} replace />;
  }

  return <RegisterPage locale={activeLocale} redirectTo={redirectTo} />;
}

function ForgotPasswordPageWrapper() {
  const { locale = 'en' } = useParams();
  const location = useLocation();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  if (isAuthenticated()) {
    return <Navigate to={resolvePostAuthPath(activeLocale, redirectTo)} replace />;
  }

  return <ForgotPasswordPage locale={activeLocale} redirectTo={redirectTo} />;
}

function ResetPasswordPageWrapper() {
  const { locale = 'en' } = useParams();
  const location = useLocation();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');
  const token = new URLSearchParams(location.search).get('token');
  const email = new URLSearchParams(location.search).get('email');
  const hasResetContext = Boolean(token && email);

  if (isAuthenticated() && !hasResetContext) {
    return <Navigate to={resolvePostAuthPath(activeLocale, redirectTo)} replace />;
  }

  return <ResetPasswordPage locale={activeLocale} redirectTo={redirectTo} />;
}

function VerifyAccountPageWrapper() {
  const { locale = 'en' } = useParams();
  const location = useLocation();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  if (isAuthenticated()) {
    return <Navigate to={resolvePostAuthPath(activeLocale, redirectTo)} replace />;
  }

  return <VerifyAccountPage locale={activeLocale} redirectTo={redirectTo} />;
}

function OAuthCallbackPageWrapper() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';

  return <OAuthCallbackPage locale={activeLocale} />;
}

function PaypalDonationReturnPageWrapper({ mode }: { mode: 'return' | 'cancel' }) {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';

  return <PaypalDonationReturnPage locale={activeLocale} mode={mode} />;
}

function BlogArticlePageWrapper() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';

  return <BlogArticlePage locale={activeLocale} />;
}

function NotFoundPageWrapper() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';

  return <NotFoundPage locale={activeLocale} />;
}
