import type { NextConfig } from "next";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiBackendUrl =
  configuredApiUrl && /^https?:\/\//i.test(configuredApiUrl)
    ? configuredApiUrl.replace(/\/api\/?$/, "")
    : undefined;
const isProductionBuild = process.env.NODE_ENV === "production";
const localBackendUrl = "http://localhost:5000";
const isLoopbackUrl = (value: string) => {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(value).hostname);
  } catch {
    return false;
  }
};
const usableInThisBuild = (value?: string) =>
  value && !(isProductionBuild && isLoopbackUrl(value)) ? value : undefined;
const backendUrl =
  usableInThisBuild(process.env.BACKEND_URL) ||
  usableInThisBuild(apiBackendUrl) ||
  (isProductionBuild ? undefined : localBackendUrl);
const socketUrl =
  usableInThisBuild(process.env.NEXT_PUBLIC_SOCKET_URL) ||
  usableInThisBuild(apiBackendUrl) ||
  usableInThisBuild(process.env.BACKEND_URL) ||
  (isProductionBuild ? undefined : localBackendUrl);

const nextConfig: NextConfig = {
  ...(socketUrl ? { env: { NEXT_PUBLIC_SOCKET_URL: socketUrl } } : {}),
  async rewrites() {
    return backendUrl
      ? [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }]
      : [];
  },
};

export default nextConfig;
