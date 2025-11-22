'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for error in URL parameters (from OAuth callback)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Map NextAuth error codes to user-friendly messages
      switch (errorParam) {
        case 'Callback':
          errorMessage = 'OAuth callback error. Database connection issue - please check your database configuration.';
          break;
        case 'Configuration':
          errorMessage = 'Server configuration error. Please contact support.';
          break;
        case 'AccessDenied':
          errorMessage = 'Access denied. Please grant the necessary permissions.';
          break;
        case 'Verification':
          errorMessage = 'Verification failed. Please try again.';
          break;
        default:
          errorMessage = `Authentication error: ${errorParam}. Please try again.`;
      }
      
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Sign in with Google and redirect to dashboard
      // Using redirect: true will handle the OAuth flow automatically
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '600', 
            color: '#1F2937', 
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            ExeAI
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0
          }}>
            Let it work for you
          </p>
        </div>

        {/* Sign In Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1F2937',
            margin: '0 0 8px 0',
            textAlign: 'center'
          }}>
            Welcome Back
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            Sign in to continue to your workspace
          </p>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '12px',
              fontSize: '14px',
              marginBottom: '24px',
              border: '1px solid #FECACA'
            }}>
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'white',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#1F2937',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              marginBottom: '24px',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
              <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
              <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'white',
                  opacity: isLoading ? 0.6 : 1
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'white',
                  opacity: isLoading ? 0.6 : 1
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3B82F6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{
              color: '#3B82F6',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#9CA3AF'
        }}>
          © 2025 ExeAI. All rights reserved.
        </p>
      </div>
    </div>
  );
}