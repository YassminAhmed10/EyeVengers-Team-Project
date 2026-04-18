import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, LogIn, ShieldCheck, UserPlus } from 'lucide-react';

const defaultRole = 'client';

const AuthPage = ({ onLogin, onSignUp, loading, error, demoAccounts = [] }) => {
  const [mode, setMode] = useState('signup');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);

  const title = mode === 'login' ? 'Log In' : 'Sign Up';
  const subtitle = mode === 'login'
    ? 'Use your stored email, password, and role to enter the matching portal.'
    : 'Create an account and choose the portal you want to use.';

  const roleOptions = useMemo(() => ([
    { id: 'client', label: 'Client', description: 'Browse and purchase products' },
    { id: 'pharmacist', label: 'Pharmacist', description: 'Manage pharmacy operations' },
  ]), []);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRole(defaultRole);
    setShowPassword(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = mode === 'login'
      ? { email, password, role }
      : { firstName, lastName, email, password, role };

    if (mode === 'login') {
      onLogin(payload);
    } else {
      onSignUp(payload);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetForm();
  };

  return (
    <div
      className="auth-background min-h-screen text-slate-800 relative overflow-hidden"
    >
      <div className="absolute inset-0 auth-grid-overlay" />
      <div className="absolute inset-0 auth-light-streak" />
      <div className="auth-bg-orb auth-orb-blue -left-24 top-16 h-72 w-72" />
      <div className="auth-bg-orb auth-orb-indigo right-0 top-10 h-80 w-80" />
      <div className="auth-bg-orb auth-orb-cyan left-1/3 bottom-0 h-96 w-96" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.38),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(191,219,254,0.32),_transparent_35%)]" />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

      <div className="relative z-10 min-h-screen px-4 py-6 sm:px-6 lg:px-10 xl:px-14 flex items-center justify-center">
        <div className="w-full max-w-5xl animate-fade-in-up">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/58 backdrop-blur-2xl shadow-[0_24px_80px_rgba(59,130,246,0.16)]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(239,246,255,0.35))]" />
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-200/35 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />

            <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-slate-800">
              <div className="mx-auto max-w-3xl">
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-sky-600">
                    {title}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 leading-tight drop-shadow-sm">
                    {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
                  </h2>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-white/55 border border-sky-100 mx-auto max-w-xl backdrop-blur-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`rounded-xl py-3 text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`rounded-xl py-3 text-sm font-bold transition-all ${mode === 'signup' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5 mx-auto max-w-3xl text-left">
                  {mode === 'signup' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">First Name</label>
                        <input
                          type="text"
                          required={mode === 'signup'}
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="input-field h-12 rounded-2xl bg-white/85 text-slate-900 placeholder:text-slate-500 border-slate-200"
                          placeholder="Enter your first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Last Name</label>
                        <input
                          type="text"
                          required={mode === 'signup'}
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          className="input-field h-12 rounded-2xl bg-white/85 text-slate-900 placeholder:text-slate-500 border-slate-200"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="input-field h-12 rounded-2xl bg-white/85 text-slate-900 placeholder:text-slate-500 border-slate-200"
                        placeholder="name@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="input-field h-12 rounded-2xl pr-12 bg-white/85 text-slate-900 placeholder:text-slate-500 border-slate-200"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="block text-sm font-semibold text-slate-700 mb-3">Select Role</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {roleOptions.map((option) => (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => setRole(option.id)}
                          className={`text-left rounded-2xl border-2 p-4 transition-all backdrop-blur-md ${role === option.id ? 'border-sky-300 bg-sky-50 shadow-sm shadow-sky-100' : 'border-sky-100 bg-white/70 hover:border-sky-200 hover:bg-white'}`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="font-black text-slate-800">{option.label}</span>
                            <ShieldCheck size={18} className={role === option.id ? 'text-sky-600' : 'text-slate-300'} />
                          </div>
                          <p className="text-xs text-slate-500 leading-5">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium backdrop-blur-md">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-base disabled:opacity-70 rounded-2xl">
                    {loading ? 'Please wait...' : (
                      <>
                        {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                        {mode === 'login' ? 'Log In' : 'Create Account'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;