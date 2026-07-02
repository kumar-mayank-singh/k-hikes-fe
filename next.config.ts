import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  output: "standalone",
  allowedDevOrigins: ["*"],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://karnataka-hikes-abggffgrdchshrem.southindia-01.azurewebsites.net/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://0.0.0.0:3001/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;