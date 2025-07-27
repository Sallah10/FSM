import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /* config options here */
  // matcher: ["/dashboard/:path*", "/jobs/:path*", "/technicians/:path*", "/invoices/:path*", "/mapPage"],
webpack: (config, { }) => {
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|svg)$/i,
      issuer: /\.(js|ts)x?$/,
      use: [
        {
          loader: 'ignore-loader',
        },
      ],
    });

    return config;
  },

};

export default nextConfig;
