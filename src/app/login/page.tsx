'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

// Define validation schema with Zod
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Email/Phone is required' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
  userType: z.enum(['admin', 'client']),
  rememberMe: z.boolean().optional(),
}).refine((data) => {
  if (data.userType === 'admin') {
    // For admin/barber, accept either email OR phone number format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
    return emailRegex.test(data.identifier) || phoneRegex.test(data.identifier);
  } else {
    // For client, validate phone number format
    const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
    return phoneRegex.test(data.identifier);
  }
}, {
  message: "Please enter a valid email or phone number (for admin/barber) or phone number (for client)",
  path: ['identifier'],
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      userType: 'client',
      rememberMe: false,
    },
  });

  const userType = watch('userType');

  // Re-validate identifier when user type changes
  const handleUserTypeChange = (newUserType: 'admin' | 'client') => {
    setTimeout(() => {
      trigger('identifier');
    }, 100);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
        userType: data.userType,
      });
      
      if (result?.error) {
        setError('Invalid credentials');
        setIsLoading(false);
        return;
      }
      
      // Get the session to determine the correct redirect
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (data.userType === 'admin') {
        // Redirect based on actual role from session
        if (sessionData?.user?.role === 'barber') {
          router.push('/barber');
        } else {
          router.push('/admin');
        }
      } else {
        router.push('/client');
      }
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="absolute top-4 left-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-2">Barbaros</h1>
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-black hover:text-gray-800 transition-colors duration-200">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`flex items-center justify-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
                    userType === 'client' 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } cursor-pointer`}>
                    <input
                      type="radio"
                      value="client"
                      className="sr-only"
                      {...register('userType', {
                        onChange: (e) => handleUserTypeChange(e.target.value as 'client' | 'admin')
                      })}
                    />
                    Client
                  </label>
                </div>
                <div>
                  <label className={`flex items-center justify-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
                    userType === 'admin' 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } cursor-pointer`}>
                    <input
                      type="radio"
                      value="admin"
                      className="sr-only"
                      {...register('userType', {
                        onChange: (e) => handleUserTypeChange(e.target.value as 'client' | 'admin')
                      })}
                    />
                    Admin/Barber
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="identifier" className="form-label">
                {userType === 'admin' ? 'Email or Phone number' : 'Phone number'}
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  type="text"
                  autoComplete={userType === 'admin' ? 'email' : 'tel'}
                  placeholder={userType === 'admin' ? 'admin@barbaros.com or +1234567890' : '+1234567890'}
                  className={`form-input ${errors.identifier ? 'error' : ''}`}
                  {...register('identifier')}
                />
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded transition-colors duration-200"
                  {...register('rememberMe')}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="#" className="link">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 