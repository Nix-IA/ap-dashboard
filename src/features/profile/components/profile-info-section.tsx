'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { IconMail, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export default function ProfileInfoSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return;
        }

        setProfile({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          created_at: user.created_at
        });
      } catch (err) {
        // Error loading profile - user will see fallback message
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconUser className='h-5 w-5' />
            Informações do Perfil
          </CardTitle>
          <CardDescription>Suas informações básicas de conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-48' />
              <Skeleton className='h-4 w-64' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          {' '}
          <CardTitle className='flex items-center gap-2'>
            <IconUser className='h-5 w-5' />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            Unable to load profile information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconUser className='h-5 w-5' />
          Profile Information
        </CardTitle>
        <CardDescription>Your basic account information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-start space-x-4'>
          <Avatar className='h-16 w-16'>
            <AvatarImage
              src={profile.avatar_url}
              alt={profile.name || 'User'}
            />
            <AvatarFallback className='text-lg'>
              {getInitials(profile.name || '', profile.email)}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 space-y-3'>
            <div>
              <h3 className='text-lg font-semibold'>
                {profile.name || 'User'}
              </h3>
              {profile.name && (
                <p className='text-muted-foreground text-sm'>Full name</p>
              )}
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <IconMail className='text-muted-foreground h-4 w-4' />
              <span>{profile.email}</span>
            </div>

            <div className='text-muted-foreground text-sm'>
              <span>Member since: </span>
              <span className='font-medium'>
                {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
