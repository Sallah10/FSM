import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module, so Next must load it from node_modules
  // instead of trying to bundle it into the server build.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
