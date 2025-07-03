import * as React from 'react';

import type { UserContextValue } from '@/contexts/user-context';
import { UserContext } from '@/contexts/user-context';

export function useUser(): UserContextValue {
  const context = React.useContext(UserContext);
  console.log('context', context)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
