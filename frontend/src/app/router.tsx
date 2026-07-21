import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { PublicPage } from '../features/public/PublicPage';
import { StaffDashboardPage } from '../features/staff/StaffDashboardPage';
import { StaffProfilePage } from '../features/staff/StaffProfilePage';
import { StaffSettingsPage } from '../features/staff/StaffSettingsPage';
import { ApplicationsPage } from '../features/applications/ApplicationsPage';
import { BeneficiariesPage } from '../features/beneficiaries/BeneficiariesPage';
import { ContactMessagesPage } from '../features/contact-messages/ContactMessagesPage';
import { FundingPage } from '../features/funding/FundingPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { UsersPage } from '../features/users/UsersPage';
import { BlogManagementPage } from '../features/blog/BlogManagementPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { OAuthCallbackPage } from '../features/auth/OAuthCallbackPage';
import { VerifyAccountPage } from '../features/auth/VerifyAccountPage';
import { PaypalDonationReturnPage } from '../features/public/donate/PaypalDonationReturnPage';
import { BlogArticlePage } from '../features/public/blog/BlogArticlePage';
import { NotFoundPage } from '../features/errors/NotFoundPage';
import { LocaleRecoveryWrapper } from '../features/errors/LocaleRecoveryWrapper';
import { buildAuthPath, isAuthenticated, resolvePostAuthPath } from '../lib/auth';
import { isLocale } from '../lib/i18n';
import { buildLocalizedPath, resolveLocale, storeLocalePreference } from '../lib/localeRecovery';

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
          { path: 'donate/paypal/return', element: <PaypalDonationReturnPageWrapper mode="return" /> },
          { path: 'donate/paypal/cancel', element: <PaypalDonationReturnPageWrapper mode="cancel" /> },
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
    const localizedPath = buildLocalizedPath(location.pathname, location.search, location.hash, recovery.locale);

    return <Navigate to={localizedPath} replace />;
  }

  return <Outlet />;
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

  return <Outlet />;
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

