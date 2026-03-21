import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Hub from './pages/platform/Hub.jsx';
import HelpCenter from './pages/platform/HelpCenter.jsx';
import LegalTerms from './pages/platform/LegalTerms.jsx';
import LegalPrivacy from './pages/platform/LegalPrivacy.jsx';
import LegalCookies from './pages/platform/LegalCookies.jsx';
import Calculator from './pages/Calculator.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Tracks from './pages/platform/Tracks.jsx';
import SubjectEntry from './pages/platform/SubjectEntry.jsx';
import SubjectRouter from './pages/subjects/_shared/SubjectRouter.jsx';
import SignIn from './pages/auth/SignIn.jsx';
import SignUp from './pages/auth/SignUp.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import Profile from './pages/user/Profile.jsx';
import Settings from './pages/user/Settings.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import {
  AUTH_RESET_PATH,
  AUTH_SIGN_IN_PATH,
  AUTH_SIGN_UP_PATH,
  CALCULATOR_PATH,
  HELP_PATH,
  LEGAL_COOKIES_PATH,
  LEGAL_PRIVACY_PATH,
  LEGAL_TERMS_PATH,
  ROADMAP_PATH,
  SECTIONS,
  TRACKS_PATH,
  USER_DASHBOARD_PATH,
  USER_PROFILE_PATH,
  USER_SETTINGS_PATH,
} from './routes.js';

const MODULE_COMPONENTS = {
  // Phase 2: All discrete-math modules now use SubjectRouter for dynamic loading
  // MODULE_COMPONENTS enum deprecated - use discreteMathModules registry instead
};

export default function App() {
  const [chatHistory, setChatHistory] = useState([]);

  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout chatHistory={chatHistory} setChatHistory={setChatHistory}>
          <Routes>
            <Route path="/" element={<Hub />} />
            <Route path={TRACKS_PATH} element={<Tracks />} />
            <Route path={HELP_PATH} element={<HelpCenter />} />
            <Route path={LEGAL_TERMS_PATH} element={<LegalTerms />} />
            <Route path={LEGAL_PRIVACY_PATH} element={<LegalPrivacy />} />
            <Route path={LEGAL_COOKIES_PATH} element={<LegalCookies />} />
            <Route path={AUTH_SIGN_IN_PATH} element={<SignIn />} />
            <Route path={AUTH_SIGN_UP_PATH} element={<SignUp />} />
            <Route path={AUTH_RESET_PATH} element={<ResetPassword />} />
            <Route
              path={USER_DASHBOARD_PATH}
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path={USER_PROFILE_PATH}
              element={(
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              )}
            />
            <Route
              path={USER_SETTINGS_PATH}
              element={(
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              )}
            />

            {/* Subject-first routes */}
            <Route path="/:subject" element={<SubjectEntry />} />
            <Route path="/:subject/calculator" element={<Calculator />} />
            <Route path="/:subject/roadmap" element={<Roadmap />} />
            <Route path={CALCULATOR_PATH} element={<Calculator />} />
            <Route path={ROADMAP_PATH} element={<Roadmap />} />
            
            {/* New multi-subject module routing (Phase 2+) */}
            <Route path="/:subject/modules/:module" element={<SubjectRouter />} />
            
            {/* Legacy batch 2 modules (will be migrated in Phase 2 batch 2) */}
            {SECTIONS.map((section) => {
              const ModuleComponent = MODULE_COMPONENTS[section.slug];
              if (!ModuleComponent) return null;
              return <Route key={section.path} path={section.path} element={<ModuleComponent />} />;
            })}

            {/* Legacy redirects */}
            <Route path="/calculator" element={<Navigate to={CALCULATOR_PATH} replace />} />
            <Route path="/roadmap" element={<Navigate to={ROADMAP_PATH} replace />} />
            {SECTIONS.map((section) => (
              <Route
                key={section.legacyPath}
                path={section.legacyPath}
                element={<Navigate to={section.path} replace />}
              />
            ))}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
