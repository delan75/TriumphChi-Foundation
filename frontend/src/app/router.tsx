import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { PublicPage } from '../features/public/PublicPage';
import { StaffDashboardPage } from '../features/staff/StaffDashboardPage';
import { ApplicationsPage } from '../features/applications/ApplicationsPage';
import { BeneficiariesPage } from '../features/beneficiaries/BeneficiariesPage';
import { FundingPage } from '../features/funding/FundingPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { isLocale } from '../lib/i18n';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/en" replace />,
  },
  {
    path: '/:locale',
    element: <AppShell />,
    children: [
      { index: true, element: <PublicPage /> },
      { path: 'staff', element: <StaffDashboardPage /> },
      { path: 'staff/applications', element: <ApplicationsPage /> },
      { path: 'staff/beneficiaries', element: <BeneficiariesPage /> },
      { path: 'staff/funding', element: <FundingPage /> },
      { path: 'staff/reports', element: <ReportsPage /> },
      { path: ':pageSlug', element: <PublicPage /> },
    ],
  },
  {
    path: '/:locale/login',
    element: <LoginPageWrapper />,
  },
  {
    path: '/:locale/register',
    element: <RegisterPageWrapper />,
  },
  {
    path: '/:locale/forgot-password',
    element: <ForgotPasswordPageWrapper />,
  },
  {
    path: '/:locale/reset-password',
    element: <ResetPasswordPageWrapper />,
  },
]);

function LoginPageWrapper() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  return <LoginPage locale={activeLocale} />;
}

function RegisterPageWrapper() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  return <RegisterPage locale={activeLocale} />;
}

function ForgotPasswordPageWrapper() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  return <ForgotPasswordPage locale={activeLocale} />;
}

function ResetPasswordPageWrapper() {
  const { locale = 'en' } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  return <ResetPasswordPage locale={activeLocale} />;
}

