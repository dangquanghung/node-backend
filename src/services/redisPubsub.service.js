const { createClient } = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscriber = createClient({ url: 'redis://localhost:6381'});
        this.publisher = createClient({ url: 'redis://localhost:6381'});

        this.subscriber.connect();
        this.publisher.connect();
    }

    async publish(channel, message) {
        try {
            const result = await this.publisher.publish(channel, message);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async subscribe(channel, callback) {
        this.subscriber.subscribe(channel, (message) => {
            callback(channel, message);
        });
    }
}

module.exports = new RedisPubSubService();
