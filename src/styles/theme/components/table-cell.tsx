import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiTableCell = {
  styleOverrides: {
    root: { borderTop:'var(--TableCell-borderWidth, 1px) solid var(--mui-palette-TableCell-border)', borderBottom: 'var(--TableCell-borderWidth, 1px) solid var(--mui-palette-TableCell-border)',padding: '5px' },
    paddingCheckbox: { padding: '0 0 0 20px' },
  },
} satisfies Components<Theme>['MuiTableCell'];
