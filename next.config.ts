import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // AWS S3 buckets (any region, any bucket under amazonaws.com)
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      // CloudFront CDN distributions
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
