import type { TypographyOptions } from '@mui/material/styles/createTypography';


// ✅ Step 2: Load Poppins with required weights


// ✅ Step 3: Use Poppins in typography
export const typography = {
  fontFamily: `poppins, sans-serif`,
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.57 },
  button: { fontWeight: 500 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
  subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.57 },
  subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
    lineHeight: 2.5,
    textTransform: 'uppercase',
  },
  h1: { fontSize: '3.5rem', fontWeight: 500, lineHeight: 1.2 },
  h2: { fontSize: '3rem', fontWeight: 500, lineHeight: 1.2 },
  h3: { fontSize: '2.25rem', fontWeight: 500, lineHeight: 1.2 },
  h4: { fontSize: '2rem', fontWeight: 500, lineHeight: 1.2 },
  h5: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.2 },
  h6: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.2 },
} satisfies TypographyOptions;
