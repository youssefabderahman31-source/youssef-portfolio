import type { NextConfig } from "next";

function supabaseHostnameFromEnv(): string | undefined {
  try {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!raw) return undefined;
    const u = new URL(raw);
    return u.hostname;
  } catch (e) {
    return undefined;
  }
}

const supaHost = supabaseHostnameFromEnv();

const remotePatterns: any[] = [
  { protocol: 'https', hostname: 'storage.googleapis.com' },
  { protocol: 'https', hostname: 'image2url.com' },
];

if (supaHost) remotePatterns.push({ protocol: 'https', hostname: supaHost });

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
