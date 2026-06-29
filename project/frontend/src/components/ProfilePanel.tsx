import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProfilePanelProps {
  onClose: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ onClose }) => {
  const { userEmail, userName, logout, updateProfile } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  const [editName, setEditName] = useState(userName ?? '');
  const [editEmail, setEditEmail] = useState(userEmail ?? '');
  const [saved, setSaved] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  // Keep form in sync if context values change
  const nameRef = useRef(userName);
  useEffect(() => {
    if (nameRef.current !== userName) {
      setEditName(userName ?? '');
      nameRef.current = userName;
    }
  }, [userName]);

  const handleSave = () => {
    if (!editName.trim() || !editEmail.trim()) return;
    updateProfile(editName.trim(), editEmail.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
  };

  const initials = (userName ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`relative z-20 flex h-full w-full max-w-sm flex-col border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">Profile & Settings</h2>
          <button
            id="close-profile-panel-btn"
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile section */}
          <div className="flex flex-col items-center px-6 pt-8 pb-6 border-b border-white/10">
            {/* Avatar */}
            <div className="relative mb-4">
              <img
                src="/profile-avatar.png"
                alt="Profile avatar"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-black shadow-xl"
                onError={(e) => {
                  // Fallback to initials if image fails
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-black shadow-xl';
                    fallback.textContent = initials;
                    parent.appendChild(fallback);
                  }
                }}
              />
              <div className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-emerald-400 border-2 border-black" title="Online" />
            </div>
            <h3 className="text-lg font-semibold text-white">{userName ?? 'User'}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{userEmail ?? ''}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Analyst · ClearVision AI
            </span>
          </div>

          {/* Account Settings */}
          <div className="px-5 py-6 border-b border-white/10 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Account Settings</h4>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="profile-name">
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder-gray-500 transition focus:border-cyan-400/60"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="profile-email">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder-gray-500 transition focus:border-cyan-400/60"
                placeholder="your@email.com"
              />
            </div>

            <button
              id="save-profile-btn"
              onClick={handleSave}
              className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-400 active:scale-95 min-h-[44px]"
            >
              {saved ? '✅ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Preferences */}
          <div className="px-5 py-6 border-b border-white/10 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Preferences</h4>

            {[
              { id: 'pref-notif', label: 'Email notifications', defaultChecked: true },
              { id: 'pref-history', label: 'Auto-save job history', defaultChecked: true },
            ].map(({ id, label, defaultChecked }) => (
              <div key={id} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{label}</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input id={id} type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                  <div className="h-5 w-9 rounded-full bg-white/10 peer-checked:bg-cyan-500 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="px-5 py-6 border-b border-white/10">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Session Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Jobs Run', value: '—' },
                { label: 'Role', value: 'Analyst' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-center">
                  <p className="text-lg font-semibold text-white">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logout — sticky at bottom */}
        <div className="border-t border-white/10 px-5 py-4">
          <button
            id="profile-panel-logout-btn"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 active:scale-95 min-h-[48px]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
