'use client';

import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/sign-in');
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace('/auth/sign-in');
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) return null; // or a loading spinner
  if (!authenticated) return null;

  return (
    <KBar>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {/* page main content */}
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
