import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { statsService } from '../../services/stats.service';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

export default function LoginPage() {
  const { isAuthenticated, isLoading, user, login } = useAuth();
  const navigate = useNavigate();

  const [actionLoading, setActionLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState({ totalStudents: 0, totalRecruiters: 0, totalProjects: 0 });

  /* ── Fetch platform stats from DB ── */
  useEffect(() => {
    statsService.getPublicStats()
      .then(res => {
        if (res.data?.data) setPlatformStats(res.data.data);
      })
      .catch(() => { /* silently fail — stats are non-critical */ });
  }, []);

  /* ── Redirect if already logged in ── */
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'RECRUITER') navigate('/recruiter/dashboard', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const handleAuth0Login = async () => {
    setActionLoading(true);
    const toastId = toast.loading('Redirecting to Auth0...');
    try {
      await login();
    } catch (error) {
      console.error(error);
      toast.error('Auth0 Redirect failed.', { id: toastId });
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 py-8 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 dark:bg-slate-950 p-12 gap-10">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 overflow-hidden rounded-lg flex items-center justify-center shrink-0">
                <img
                  src={logo}
                  alt="LaunchPad"
                  className="w-full h-full object-contain scale-[1.8]"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">LaunchPad</span>
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Where student<br />builders get<br />discovered.
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed font-light">
              Showcase your projects to thousands of recruiters and industry leaders worldwide.
            </p>
          </div>

          <div className="flex items-center gap-5 pt-4 border-t border-slate-800">
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{platformStats.totalStudents}</span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Students</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{platformStats.totalRecruiters}</span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recruiters</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{platformStats.totalProjects}</span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Projects</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 tracking-wider">LaunchPad &copy; {new Date().getFullYear()}</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-gray-900">
          <div className="w-full flex flex-col gap-6">

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Sign in</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use your Auth0 account to continue</p>
            </div>

            {/* Auth0 Sign-In */}
            <div className="flex flex-col gap-2.5">
              <button
                id="auth0-signin-btn"
                onClick={handleAuth0Login}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition duration-200 shadow-sm text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed w-full max-w-[320px]"
              >
                {actionLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Continue with Auth0</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              New here? Your account is created automatically on first sign in.
              By continuing you agree to our{' '}
              <span className="text-blue-600 dark:text-blue-400 cursor-pointer underline hover:text-blue-700 dark:hover:text-blue-300">Terms of Service</span> and{' '}
              <span className="text-blue-600 dark:text-blue-400 cursor-pointer underline hover:text-blue-700 dark:hover:text-blue-300">Privacy Policy</span>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
