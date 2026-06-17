import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { PublicHomePage } from '../features/public/PublicHomePage';
import { StaffDashboardPage } from '../features/staff/StaffDashboardPage';
import { ApplicationsPage } from '../features/applications/ApplicationsPage';
import { BeneficiariesPage } from '../features/beneficiaries/BeneficiariesPage';
import { FundingPage } from '../features/funding/FundingPage';
import { ReportsPage } from '../features/reports/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/en" replace />,
  },
  {
    path: '/:locale',
    element: <AppShell />,
    children: [
      { index: true, element: <PublicHomePage /> },
      { path: 'staff', element: <StaffDashboardPage /> },
      { path: 'staff/applications', element: <ApplicationsPage /> },
      { path: 'staff/beneficiaries', element: <BeneficiariesPage /> },
      { path: 'staff/funding', element: <FundingPage /> },
      { path: 'staff/reports', element: <ReportsPage /> },
    ],
  },
]);

