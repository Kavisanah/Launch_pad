import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { USER_ROLES } from './utils/constants';

// Import Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/student/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import EditProjectPage from './pages/student/EditProjectPage';
import PublicProfilePage from './pages/PublicProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import NotFoundPage from './pages/NotFoundPage';

const router = createBrowserRouter([
  // Public and Client Authenticated routes using MainLayout
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/projects',
        element: <ProjectsPage />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetailPage />,
      },
      {
        path: '/users/:id',
        element: <PublicProfilePage />,
      },

      // Authenticated routes (any role)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/profile',
            element: <MyProfilePage />,
          },
          {
            path: '/notifications',
            element: <NotificationsPage />,
          },
        ],
      },

      // Student-only routes
      {
        element: <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} />,
        children: [
          {
            path: '/projects/new',
            element: <CreateProjectPage />,
          },
          {
            path: '/projects/:id/edit',
            element: <EditProjectPage />,
          },
        ],
      },

      // Recruiter-only routes
      {
        element: <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]} />,
        children: [
          {
            path: '/recruiter/dashboard',
            element: <RecruiterDashboardPage />,
          },
        ],
      },
    ],
  },

  // Admin routes using AdminLayout
  {
    element: <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/admin/dashboard',
            element: <AdminDashboardPage />,
          },
          {
            path: '/admin/users',
            element: <AdminUsersPage />,
          },
          {
            path: '/admin/projects',
            element: <AdminProjectsPage />,
          },
        ],
      },
    ],
  },

  // Catch-all 404 route inside MainLayout
  {
    element: <MainLayout />,
    children: [
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function App() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email',
      }}
      cacheLocation="memory"
    >
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </Auth0Provider>
  );
}
