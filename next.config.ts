import type { NextConfig } from "next";

/* Basic security headers: no MIME sniffing, no embedding in other sites'
   frames, a careful Referer and disabled browser APIs. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  /* for the Docker image: only the needed files and server.js, without the full node_modules */
  output: "standalone",
  reactCompiler: true,
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
