import React, { useState, useEffect } from 'react';
import { UserRole, UserAccount } from './types';
import { gasService } from './services/gasService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GasConfigModal } from './components/GasConfigModal';
import { PanduanDeployModal } from './components/PanduanDeployModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import { HomePage } from './pages/HomePage';
import { SyaratPage } from './pages/SyaratPage';
import { AlurPage } from './pages/AlurPage';
import { CekKelulusanPage } from './pages/CekKelulusanPage';
import { AuthPage } from './pages/AuthPage';
import { SiswaDashboard } from './pages/dashboard/SiswaDashboard';
import { GuruDashboard } from './pages/dashboard/GuruDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(gasService.getCurrentUser());
  const [userRole, setUserRole] = useState<UserRole>(() => (currentUser ? currentUser.role : 'public'));
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [siswaSubTab, setSiswaSubTab] = useState<'biodata' | 'wawancara-siswa' | 'wawancara-ortu' | 'kartu'>('biodata');
  const [guruSubTeam, setGuruSubTeam] = useState<'ortu' | 'siswa' | 'data-induk'>('ortu');
  const [isGasModalOpen, setIsGasModalOpen] = useState<boolean>(false);
  const [isPanduanModalOpen, setIsPanduanModalOpen] = useState<boolean>(false);
  const [isGasConfigured, setIsGasConfigured] = useState<boolean>(gasService.isLiveGasConfigured());

  useEffect(() => {
    // Scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  useEffect(() => {
    // Sinkronisasi otomatis seluruh database & Sheet Setting dari Spreadsheet saat aplikasi dibuka
    if (gasService.isLiveGasConfigured()) {
      gasService.syncFromSpreadsheet().then(() => {
        setIsGasConfigured(gasService.isLiveGasConfigured());
      });
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    if (!currentUser) {
      setUserRole('public');
      return;
    }
    setUserRole(currentUser.role);
  };

  const handleOpenGasConfig = () => {
    setIsGasModalOpen(true);
  };

  const handleOpenPanduan = () => {
    setIsPanduanModalOpen(true);
  };

  const handleSelectTab = (tab: string) => {
    // Jika tidak login, maka menu akses portal ditutup (arahkan ke halaman login)
    if (tab === 'dashboard-siswa' || tab === 'dashboard-guru') {
      if (!currentUser) {
        setUserRole('public');
        setCurrentTab('login');
        return;
      }
      // Role 3: Admin -> boleh mengakses Portal Siswa maupun Menu Pewawancara
      if (currentUser.role === 'admin') {
        setUserRole('admin');
        setCurrentTab(tab);
        return;
      }
      // Role 2: Pewawancara -> hanya menu pewawancara yang dibuka
      if (currentUser.role === 'guru') {
        setUserRole('guru');
        setCurrentTab('dashboard-guru');
        return;
      }
      // Role 1: Calon Siswa -> hanya portal siswa yang terbuka
      if (currentUser.role === 'siswa') {
        setUserRole('siswa');
        setCurrentTab('dashboard-siswa');
        return;
      }
    }

    setCurrentTab(tab);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      // 3. Login kode Admin -> akses penuh (buka Menu Pewawancara / Admin default)
      setUserRole('admin');
      setCurrentTab('dashboard-guru');
    } else if (user.role === 'guru') {
      // 2. Login kode Pewawancara -> buka Menu Pewawancara
      setUserRole('guru');
      setCurrentTab('dashboard-guru');
    } else {
      // 1. Login kode Calon Siswa -> buka Portal Siswa
      setUserRole('siswa');
      setCurrentTab('dashboard-siswa');
    }
  };

  const handleLogout = () => {
    gasService.logoutUser();
    setCurrentUser(null);
    setUserRole('public');
    setIsGasModalOpen(false);
    setIsPanduanModalOpen(false);
    setCurrentTab('home');
  };

  const handleGoToLogin = () => {
    setCurrentTab('login');
  };

  const handleGoToRegister = () => {
    setCurrentTab('daftar');
  };

  const handleConfigChanged = () => {
    setIsGasConfigured(gasService.isLiveGasConfigured());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        onOpenGasConfig={handleOpenGasConfig}
        onOpenPanduan={handleOpenPanduan}
        isGasConfigured={isGasConfigured}
        currentUser={currentUser}
        onGoToLogin={handleGoToLogin}
        onGoToRegister={handleGoToRegister}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${currentUser ? 'pb-24 lg:pb-12' : ''}`}>
        {currentTab === 'home' && (
          <HomePage
            onSelectTab={handleSelectTab}
            onOpenPortalSiswa={() => handleSelectTab('dashboard-siswa')}
            onOpenPortalGuru={() => handleSelectTab('dashboard-guru')}
            onOpenGasConfig={handleOpenGasConfig}
            onGoToLogin={handleGoToLogin}
            onGoToRegister={handleGoToRegister}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'login' && (
          <AuthPage
            initialMode="login"
            onLoginSuccess={handleLoginSuccess}
            onGoToHome={() => handleSelectTab('home')}
          />
        )}

        {currentTab === 'daftar' && (
          <AuthPage
            initialMode="register"
            onLoginSuccess={handleLoginSuccess}
            onGoToHome={() => handleSelectTab('home')}
          />
        )}

        {currentTab === 'syarat' && (
          <SyaratPage
            onGoToRegister={handleGoToRegister}
          />
        )}

        {currentTab === 'alur' && (
          <AlurPage
            onGoToRegister={handleGoToRegister}
            onGoToCheckResult={() => handleSelectTab('cek-kelulusan')}
          />
        )}

        {currentTab === 'cek-kelulusan' && (
          <CekKelulusanPage
            onGoToRegister={handleGoToRegister}
          />
        )}

        {currentTab === 'dashboard-siswa' && (currentUser?.role === 'siswa' || currentUser?.role === 'admin') && (
          <SiswaDashboard
            onOpenGasConfig={handleOpenGasConfig}
            currentUser={currentUser}
            onLogout={handleLogout}
            onGoToLogin={handleGoToLogin}
            activeTab={siswaSubTab}
            onTabChange={setSiswaSubTab}
          />
        )}

        {currentTab === 'dashboard-guru' && (currentUser?.role === 'guru' || currentUser?.role === 'admin') && (
          <GuruDashboard
            onOpenGasConfig={handleOpenGasConfig}
            onOpenPanduan={handleOpenPanduan}
            currentUser={currentUser}
            onLogout={handleLogout}
            activeTeam={guruSubTeam}
            onTeamChange={setGuruSubTeam}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenGasConfig={handleOpenGasConfig}
        onOpenPanduan={handleOpenPanduan}
        currentUser={currentUser}
      />

      {/* PWA Offline Mode Indicator */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar (< lg) - Tampil setelah login */}
      <MobileBottomNav
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onRoleChange={handleRoleChange}
        siswaSubTab={siswaSubTab}
        onSiswaSubTabChange={setSiswaSubTab}
        guruSubTeam={guruSubTeam}
        onGuruSubTeamChange={setGuruSubTeam}
        onOpenGasConfig={handleOpenGasConfig}
        onOpenPanduan={handleOpenPanduan}
        onLogout={handleLogout}
      />

      {/* Google Apps Script & Google Spreadsheet Database Config Modal — HANYA ADMIN */}
      {currentUser?.role === 'admin' && (
        <GasConfigModal
          isOpen={isGasModalOpen}
          onClose={() => setIsGasModalOpen(false)}
          onConfigChanged={handleConfigChanged}
          onOpenPanduan={handleOpenPanduan}
        />
      )}

      {/* Netlify, GitHub & GAS Deployment Guide Modal — HANYA ADMIN */}
      {currentUser?.role === 'admin' && (
        <PanduanDeployModal
          isOpen={isPanduanModalOpen}
          onClose={() => setIsPanduanModalOpen(false)}
        />
      )}

    </div>
  );
}
