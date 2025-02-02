import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    LLM_ENDPOINT: process.env.LLM_ENDPOINT
  }
};

export default nextConfig;
