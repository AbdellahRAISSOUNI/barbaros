'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { FaArrowLeft, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

// Define validation schema with Zod
const registerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phoneNumber: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^\+?[0-9\s\-()]{7,}$/, { message: 'Must be a valid phone number' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string().min(1, { message: 'Confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Register the client
      const response = await axios.post('/api/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        password: data.password,
      });
      
      if (response.data.success) {
        setSuccess('Registration successful! Signing you in...');
        
        // Sign in the user
        const result = await signIn('credentials', {
          redirect: false,
          identifier: data.phoneNumber,
          password: data.password,
          userType: 'client',
        });
        
        if (result?.error) {
          setError('Registration successful but failed to sign in. Please try logging in.');
          setIsLoading(false);
          return;
        }
        
        // Redirect to client dashboard
        router.push('/client');
      } else {
        setError(response.data.message || 'Registration failed');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred');
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
          Create your account
        </h2>
        <p className="text-center text-sm text-[var(--dark-brown)] opacity-70 font-light">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--deep-green)] hover:text-[var(--dark-red)] transition-colors duration-300 font-normal">
            Sign in
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
          
          {success && (
            <div className="mb-6 bg-[var(--deep-green)] text-white px-4 py-3 text-sm font-light" role="alert">
              <span className="block">{success}</span>
            </div>
          )}
          
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-light text-[var(--deep-green)] mb-2 tracking-wider">
                  FIRST NAME
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  className={`w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300 ${
                    errors.firstName ? 'border-[var(--dark-red)] border-opacity-60' : ''
                  }`}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="mt-2 text-xs text-[var(--dark-red)] font-light">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-light text-[var(--deep-green)] mb-2 tracking-wider">
                  LAST NAME
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={`w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300 ${
                    errors.lastName ? 'border-[var(--dark-red)] border-opacity-60' : ''
                  }`}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="mt-2 text-xs text-[var(--dark-red)] font-light">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-light text-[var(--deep-green)] mb-2 tracking-wider">
                PHONE NUMBER
              </label>
              <input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="+1234567890"
                className={`w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300 ${
                  errors.phoneNumber ? 'border-[var(--dark-red)] border-opacity-60' : ''
                }`}
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && (
                <p className="mt-2 text-xs text-[var(--dark-red)] font-light">{errors.phoneNumber.message}</p>
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
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-light text-[var(--deep-green)] mb-2 tracking-wider">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full bg-transparent border-b border-[var(--deep-green)] border-opacity-20 py-3 text-sm font-light tracking-wider text-[var(--dark-brown)] placeholder-gray-400 focus:outline-none focus:border-[var(--deep-green)] transition-colors duration-300 ${
                    errors.confirmPassword ? 'border-[var(--dark-red)] border-opacity-60' : ''
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-[var(--dark-red)] font-light">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--dark-red)] text-white py-4 text-sm font-light tracking-wider hover:bg-[var(--premium-green)] transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Creating Account...
                </span>
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 