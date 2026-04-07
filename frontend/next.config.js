/** @type {import('next').NextConfig} */

const backendURLWithoutProtocol = process.env.BACKEND_URL.replace(/^https?:\/\//, "");

const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5001",
    STRIPE_ID: process.env.STRIPE_ID || "pk_test_51OP59GDoGYotiWHLoyrEnu2W4W6XYmPk94V4iJw66c3h5YSZktk4JqLJEp59PVDbwOomBqDcfuiZ0PrZpWK8Oo4f00g0ioukHS",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: backendURLWithoutProtocol,
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "ssl.gstatic.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ssl.gstatic.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "img.shein.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "ssl.gstatic.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
