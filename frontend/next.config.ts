import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SOCKET_URL: (
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      backendUrl
    ).replace(/\/$/, ""),
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
