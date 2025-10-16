import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.BACKEND_URL || "http://localhost:4000"
        }/:path*`,
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/auth",
        destination: "/auth/signin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
