import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to check if the user has completed onboarding
 * and redirect accordingly.
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.redirect - Whether to automatically redirect based on status
 * @param {string} options.redirectTo - Where to redirect if onboarding is incomplete
 * @param {boolean} options.requireOnboarding - Whether the current page requires onboarding to be complete
 * @returns {Object} The onboarding status and loading state
 */
export default function useOnboardingStatus({ 
  redirect = true, 
  redirectTo = '/onboarding',
  requireOnboarding = false 
} = {}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!isLoaded || !isSignedIn) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch('/api/users/status');
        const json = await res.json();
        const data = json.data;
        setOnboardingCompleted(data.onboarding_completed);
        
        // Handle redirects based on onboarding status
        if (redirect) {
          if (requireOnboarding && !data.onboarding_completed) {
            // If the page requires onboarding to be complete, but it's not, redirect to onboarding
            router.push(redirectTo);
          } else if (!requireOnboarding && data.onboarding_completed && window.location.pathname === '/onboarding') {
            // If we're on the onboarding page but it's already completed, redirect to planner
            router.push('/plans');
          } else if (!data.onboarding_completed && window.location.pathname !== '/onboarding' && window.location.pathname !== '/sign-in' && window.location.pathname !== '/sign-up') {
            // If onboarding is not completed and we're not on the login/sign-up/onboarding pages, redirect to onboarding
            router.push(redirectTo);
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [isLoaded, isSignedIn, redirect, redirectTo, requireOnboarding, router]);

  return { onboardingCompleted, isLoading, error };
} 