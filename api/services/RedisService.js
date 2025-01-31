const Redis = require('redis');
const Promise = require('bluebird');

const redisClient = Redis.createClient({
    port: sails.config.custom.REDIS_PORT,
    host: sails.config.custom.REDIS_HOST,
    password:sails.config.custom.REDIS_PASSWORD
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = {

    /**
     * Insert data in redis
     */

    setData: (key, value, time) => {
        redisClient.set(key, JSON.stringify(value));
        if (time) {
            redisClient.expire(key, time);
        }
    },

    /**
     * Fetch data from redis
     */

    getData: async (key) => {
        return new Promise((resolve, reject) => {
            redisClient.get(key, (err, result) => {
                if (err) reject(err);
                if (result) {
                    resolve(JSON.parse(result))
                } else {
                    reject()
                }
            });
        });
    },

    /**
     * Insert data in redis
     */

    setFCMToken: (key, value) => {
        redisClient.set(key, value);
    },

    /**
     * Remove redis data
     */

    removeData: (key) => {
        return new Promise((resolve, reject) => {
            redisClient.del(key, (err, result) => {
                if (err) reject(err);
                resolve(JSON.parse(result));
            });
        });
    },

};
