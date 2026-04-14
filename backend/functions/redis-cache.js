const redis = require("../redis");
const defaultExpiration = Number(process.env.DEFAULT_EXPIRATION_TIME || 3600);
module.exports.getOrSetCache = (key, callback) => {
    console.log(`\nCACHE ${key}`);
    return new Promise(async (resolve, reject) => {
        if (redis.isOpen && redis.isReady) {
            const value = await redis.get(key);
            if (value === null || value === undefined) {
                console.log("CACHE MISS");
                callback()
                    .then((newData) => {
                    redis.setEx(key, defaultExpiration, JSON.stringify(newData));
                    resolve(newData);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else {
                console.log("CACHE HIT");
                resolve(JSON.parse(value));
            }
        }
        else {
            callback()
                .then((newData) => {
                redis.setEx(key, defaultExpiration, JSON.stringify(newData));
                resolve(newData);
            })
                .catch((error) => {
                reject(error);
            });
        }
    });
};
module.exports.deleteCache = (key) => {
    return new Promise(async (resolve) => {
        const result = await redis.del(key);
        if (result) {
            console.log(`\nCACHE DELETE ${key}`);
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
};
module.exports.setCache = (key, data) => {
    console.log(`\nCACHE SET ${key}`);
    return redis.setEx(key, defaultExpiration, JSON.stringify(data));
};
module.exports.getCache = (key) => {
    console.log(`\nCACHE GET ${key}`);
    return redis.get(key);
};

