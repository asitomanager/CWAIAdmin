'use client';

import * as React from 'react';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  updateUser: (user: User, error?: string | null, isLoading?: boolean) => void;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean }>({
    user: null,
    error: null,
    isLoading: true,
  });

  const updateUser = (user: User, error: string | null = null, isLoading: boolean | null = null) => {
    setState((prev) => ({
      user,
      error: error ?? prev.error,
      isLoading: isLoading ?? prev.isLoading,
    }));
  };

  const checkSession = React.useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        setState({ user: null, error: 'Something went wrong', isLoading: false });
        return;
      }

      setState({ user: data ?? null, error: null, isLoading: false });
    } catch (err) {
      logger.error(err);
      setState({ user: null, error: 'Something went wrong', isLoading: false });
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => { logger.error(err); });
  }, [checkSession]);

  return <UserContext.Provider value={{ ...state, checkSession, updateUser }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;