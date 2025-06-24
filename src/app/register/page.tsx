'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-black hover:text-gray-800 transition-colors duration-200">
            Sign in
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
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative animate-fade-in" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="form-label">
                  First name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="form-label">
                Phone number
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1234567890"
                  className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                  {...register('phoneNumber')}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
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
                  autoComplete="new-password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 