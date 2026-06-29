import { useEffect, useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal = ({ isOpen, onClose, onSuccess }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your official email and password.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl shadow-black/50">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Secure access</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Official portal login</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-gray-200 transition hover:bg-white/20"
          >
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-gray-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="official@organization.gov"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-0 placeholder:text-gray-500"
            />
          </label>

          <label className="block text-sm text-gray-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-0 placeholder:text-gray-500"
            />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button type="submit" className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-gray-200">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
