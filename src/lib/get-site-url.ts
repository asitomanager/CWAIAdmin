export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Use custom site URL from environment variables (Production).
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically provided by Vercel.
    'http://localhost:3001/'; // Default URL for local development.
  
  // Ensure the URL includes http(s) if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Prepend https:// by default if not provided (best for production)
    url = `https://${url}`;
  }
  
  // Ensure the URL ends with a trailing slash
  if (!url.endsWith('/')) {
    url = `${url}/`;
  }

  return url;
}