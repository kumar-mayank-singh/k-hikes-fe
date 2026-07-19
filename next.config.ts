import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL ??
  "https://karnataka-hikes-abggffgrdchshrem.southindia-01.azurewebsites.net";

const nextConfig: NextConfig = {
  distDir: "build",
  allowedDevOrigins: ["*"],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;