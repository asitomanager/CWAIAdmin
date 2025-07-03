'use client';

import type { User } from '@/types/user';
import { logger } from '../default-logger';
import { paths } from '@/paths';


const user = {
  id: 'USR-000',
  //avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
  userdata: null
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    //const token = generateToken();
    localStorage.getItem('app_access_token');

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    // Make API request

    // We do not handle the API, so we'll check if the credentials match with the hardcoded ones.
    if (email !== 'sofia@devias.io' || password !== 'rt1729') {
      return { error: 'Invalid credentials' };
    }

    localStorage.getItem('app_access_token');
    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('app_access_token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {

    try {
      const accessToken = localStorage.getItem('app_access_token');
      const refreshToken = localStorage.getItem('app_refresh_token');

      if (!accessToken || !refreshToken) {
        logger.error('No tokens found for logout');
        return {};
      }

      const response = await fetch(paths.urls.logout, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'access-token': accessToken.replace(/^"|"$/g, ''),
          'refresh-token': refreshToken.replace(/^"|"$/g, ''),
        },
      });

      if (!response.ok) {
        logger.error('Backend logout failed', await response.text());
      }

      localStorage.removeItem('app_access_token');
      localStorage.removeItem('app_refresh_token');
      localStorage.removeItem('app_user_name');

    } catch (err) {
      logger.error('Sign out error', err);
    }
    return {};
  }
}

export const authClient = new AuthClient();
