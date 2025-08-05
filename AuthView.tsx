import React, { useState } from 'react';

interface AuthViewProps {
  onLogin: () => void;
  onSwitchToCustomer: () => void;
}

const CORRECT_EMAIL = "ismailismail04949@gmail.com";
const CORRECT_PASSWORD = "Shaik@123";

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onSwitchToCustomer }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
      setError('');
      onLogin();
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-8">Shop Owner Login</h2>
        <form onSubmit={handleLoginAttempt} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-800 transition-transform transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
      <div className="mt-6 text-center">
        <button onClick={onSwitchToCustomer} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Back to Customer View
        </button>
      </div>
    </div>
  );
};