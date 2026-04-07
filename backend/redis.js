const { createClient } = require("redis");

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 16272,
  },
  legacyMode: true,
});

client.on("error", (error) => {
  console.error(error);
});

client.connect();

client.flushAll("ASYNC", (error, succeeded) => {
  console.log(succeeded); // will be true if successfull
});

module.exports = client;
