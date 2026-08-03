'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/login.schema';
import { useLogin } from '../hooks/use-login';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function LoginForm() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { mutate: login, isPending } = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: 'password',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setErrorMsg(null);
    login(data, {
      onError: (err: any) => {
        setErrorMsg(err?.response?.data?.message || 'Login failed. Please try again.');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Username
          </label>
          <div className="relative">
            <input
              {...register('username')}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                errors.username 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
              }`}
              placeholder="Enter your username"
            />
          </div>
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type="password"
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                errors.password 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
              }`}
              placeholder="Enter your password"
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-indigo-500/30"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Sign In
            <LogIn className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
