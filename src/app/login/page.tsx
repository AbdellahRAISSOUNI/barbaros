'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[var(--off-white)] flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{
      '--off-white': '#FAFAF8',
      '--deep-green': '#1B3B36',
      '--dark-red': '#8B2635',
      '--dark-brown': '#1A1A1A',
      '--warm-beige': '#F0EBE3',
      '--premium-green': '#2A5A4B',
    } as React.CSSProperties}>
      <div className="absolute top-6 left-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-[var(--deep-green)] hover:text-[var(--dark-red)] transition-colors duration-300 text-sm font-light tracking-wider"
        >
          <FaArrowLeft className="mr-2" />
          BACK TO HOME
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl md:text-5xl font-light text-[var(--deep-green)] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          BARBAROS
        </h1>
        <h2 className="text-center text-xl font-light text-[var(--dark-brown)] mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm text-[var(--dark-brown)] opacity-70 font-light">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[var(--deep-green)] hover:text-[var(--dark-red)] transition-colors duration-300 font-normal">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-8 border border-[var(--deep-green)] border-opacity-10">
          {error && (
            <div className="mb-6 bg-[var(--dark-red)] text-white px-4 py-3 text-sm font-light" role="alert">
              <span className="block">{error}</span>
            </div>
          )}
          
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-light text-[var(--deep-green)] mb-4 tracking-wider">
                I AM A
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`flex items-center justify-center px-4 py-3 border text-sm font-light tracking-wider transition-all duration-300 cursor-pointer ${
                    userType === 'client' 
                      ? 'bg-[var(--deep-green)] text-white border-[var(--deep-green)]' 
                      : 'bg-white text-[var(--dark-brown)] border-[var(--deep-green)] border-opacity-20 hover:border-[var(--deep-green)] hover:border-opacity-40'
                  }`}>
                    <input
                      type="radio"
                      value="client"
                      className="sr-only"
                      {...register('userType', {
                        onChange: (e) => handleUserTypeChange(e.target.value as 'client' | 'admin')
                      })}
                    />
                    CLIENT
                  </label>
                </div>
                <div>
                  <label className={`flex items-center justify-center px-4 py-3 border text-sm font-light tracking-wider transition-all duration-300 cursor-pointer ${
                    userType === 'admin' 
                      ? 'bg-[var(--deep-green)] text-white border-[var(--deep-green)]' 
                      : 'bg-white text-[var(--dark-brown)] border-[var(--deep-green)] border-opacity-20 hover:border-[var(--deep-green)] hover:border-opacity-40'
                  }`}>
                    <input
                      type="radio"
                      value="admin"
                      className="sr-only"
                      {...register('userType', {
                        onChange: (e) => handleUserTypeChange(e.target.value as 'client' | 'admin')
                      })}
                    />
                    ADMIN/BARBER
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="identifier" className="block text-sm font-light text-[var(--deep-green)] mb-2 tracking-wider">
                {userType === 'admin' ? 'EMAIL OR PHONE NUMBER' : 'PHONE NUMBER'}
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete={userType === 'admin' ? 'email' : 'tel'}
                placeholder={userType === 'admin' ? 'email@example.com or phone' : '+1234567890'}
                className={`w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300 ${
                  errors.identifier ? 'border-[var(--dark-red)] border-opacity-60' : ''
                }`}
                {...register('identifier')}
              />
              {errors.identifier && (
                <p className="mt-2 text-xs text-[var(--dark-red)] font-light">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-light text-[var(--deep-green)] mb-2 tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300 ${
                    errors.password ? 'border-[var(--dark-red)] border-opacity-60' : ''
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-[var(--dark-red)] font-light">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--deep-green)] border-[var(--deep-green)] border-opacity-20 rounded focus:ring-[var(--deep-green)]"
                  {...register('rememberMe')}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-[var(--dark-brown)] font-light">
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--dark-red)] text-white py-4 text-sm font-light tracking-wider hover:bg-[var(--premium-green)] transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Signing in...
                </span>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 