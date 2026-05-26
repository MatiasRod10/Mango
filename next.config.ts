import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija el root del workspace: hay un pnpm-lock.yaml en C:\Users\matia\
  // (ajeno al proyecto) que confundía la auto-detección de Turbopack.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
