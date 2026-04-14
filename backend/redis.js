const { createClient } = require("redis");
const createNoopRedisClient = () => ({
    isOpen: false,
    isReady: false,
    connect: async () => { },
    get: async () => null,
    setEx: async () => "OK",
    del: async () => 0,
    flushAll: async () => "OK",
});
const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;
if (!redisUrl && !redisHost) {
    module.exports = createNoopRedisClient();
}
else {
    const client = createClient(redisUrl
        ? {
            url: redisUrl,
        }
        : {
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: redisHost,
                port: Number(process.env.REDIS_PORT || 16272),
            },
        });
    client.on("error", (error) => {
        console.error("Redis error:", error.message);
    });
    client
        .connect()
        .then(async () => {
        if (process.env.REDIS_FLUSH_ON_BOOT === "true") {
            await client.flushAll("ASYNC");
        }
    })
        .catch((error) => {
        console.error("Redis connection failed:", error.message);
    });
    module.exports = client;
}
