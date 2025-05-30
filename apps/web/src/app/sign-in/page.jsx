"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { SignIn } from "@clerk/nextjs"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useBrowserSupabaseClient } from "@/lib/supabase"

const LoginPage = () => {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const supabase = useBrowserSupabaseClient()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsChecking(false)
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        const res = await fetch('/api/users/status');
        const json = await res.json();
        if (res.ok && json.data?.onboarding_completed) {
          router.push('/plans');
        } else {
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        router.push('/plans');
      } finally {
        setIsChecking(false);
      }
    };

    if (isSignedIn) {
      checkOnboardingStatus()
    }
  }, [isSignedIn, isLoaded, router, supabase])

  // Don't render anything while checking to avoid flickering
  if (isLoaded && isSignedIn && isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse">
          <Image 
            src="/logo.svg" 
            alt="Kasoku Logo" 
            width={80}
            height={80}
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Image 
          src="/logo.svg" 
          alt="Kasoku Logo" 
          width={80}
          height={80}
          priority
        />
      </div>
      
      <SignIn
        appearance={{
          layout: {
            logoPlacement: "none",
            socialButtonsVariant: "iconButton",
          },
          elements: {
            socialButtonFacebook: 'display: none',
          }
        }}
        redirectUrl="/auth/session"
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  )
}

export default LoginPage
