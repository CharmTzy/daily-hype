const backendURL = process.env.BACKEND_URL || "http://localhost:5001";
const stripeId = process.env.STRIPE_ID ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51OP59GDoGYotiWHLoyrEnu2W4W6XYmPk94V4iJw66c3h5YSZktk4JqLJEp59PVDbwOomBqDcfuiZ0PrZpWK8Oo4f00g0ioukHS";
const parsedBackendUrl = new URL(backendURL);
const nextConfig = {
    env: {
        BACKEND_URL: backendURL,
        STRIPE_ID: stripeId,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: parsedBackendUrl.protocol.replace(":", ""),
                hostname: parsedBackendUrl.hostname,
                port: parsedBackendUrl.port,
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "platform-lookaside.fbsbx.com",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.dummyjson.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ssl.gstatic.com",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "ssl.gstatic.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "i.ebayimg.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "img.shein.com",
                pathname: "/**",
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
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        outputFileTracingExcludes: {
            "*": [
                "**/node_modules/@swc/**",
                "**/node_modules/@esbuild/**",
                "**/node_modules/sharp/**",
                "**/node_modules/@next/swc-*/**",
                "**/node_modules/canvas/**",
                "**/node_modules/typescript/**",
                "**/node_modules/.cache/**",
                "**/*.tsbuildinfo",
                "**/*.map",
            ],
        },
    },
};
module.exports = nextConfig;
