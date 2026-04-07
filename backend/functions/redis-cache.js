// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

const redis = require("../redis");

/**
 * get or set cache
 * @param {*} key cache name you want to set
 * @param {*} callback function that returns data from database
 * @returns stored data from key
 * @example
 * getOrSetCache('product:1', () => {
 *      // callback function that must return data from database
 *      return model.getDataFromDatabase().then((data) => {
 *          return data;
 *      })
 * })
 * .then((data) => {
 *      console.log(data);  // this is data returned from redis cache
 * })
 * .catch((error) => {
 *      console.error(error);
 * })
 */
module.exports.getOrSetCache = (key, callback) => {
  console.log(`\nCACHE ${key}`);
  return new Promise(async (resolve, reject) => {
    if (redis.isOpen && redis.isReady) {
      const value = await redis.get(key);
      if (value === null || value === undefined) {
        console.log("CACHE MISS");
        callback()
          .then((newData) => {
            redis.setEx(key, process.env.DEFAULT_EXPIRATION_TIME, JSON.stringify(newData));
            resolve(newData);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        console.log("CACHE HIT");
        resolve(JSON.parse(value));
      }
    } else {
      callback()
        .then((newData) => {
          redis.setEx(key, process.env.DEFAULT_EXPIRATION_TIME, JSON.stringify(newData));
          resolve(newData);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

/**
 * delete redis cache with key
 * @param {*} key cache key that you want to delete
 * @returns Prosmie<boolean> - (true, false)
 * @example
 * deleteCache('product:1').then((result) => {
 *      if(result === false) {
 *          // cache delete failed
 *      }
 * })
 */
module.exports.deleteCache = (key) => {
  return new Promise(async (resolve) => {
    const result = await redis.del(key);
    if (result) {
      console.log(`\nCACHE DELETE ${key}`);
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

/**
 * set cache data
 * @param {*} key cache key name (string)
 * @param {*} data cache data (object)
 * @returns Promise
 */
module.exports.setCache = (key, data) => {
  console.log(`\nCACHE SET ${key}`);
  return redis.setEx(key, process.env.DEFAULT_EXPIRATION_TIME, JSON.stringify(data));
};

/**
 * get cache data
 * @param {*} key cache key name (string)
 * @returns Promise
 *
 */
module.exports.getCache = (key) => {
  console.log(`\nCACHE GET ${key}`);
  return redis.get(key);
};
