const amqp = require('amqplib')
const messages = 'hello, RabbitMQ for HungDQ!'


// const log = console.log

// console.log = function () {
//     log.apply(console, [new Date()].concat(arguments));
// }

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        const notificationExchange = 'notificationEx'
        const notiQueue = 'notificationQueueProcess'
        const notificationExchangeDLX = 'notificationExDLX'
        const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX'

        // 1. create exchange
        await channel.assertExchange(notificationExchange, 'direct', {
            durable: true
        })

        // 2. create queue
        const queueResult = await channel.assertQueue(notiQueue, {
            exclusive: false, // allow multiple connection access queue
            deadLetterExchange: notificationExchangeDLX,
            deadLetterRoutingKey: notificationRoutingKeyDLX
        })

        // 3. bind queue
        await channel.bindQueue(queueResult.queue, notificationExchange)

        // 4. Send message
        const msg = 'a new product'
        console.log(`producer msg::`, msg)
        await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
            expiration: '10000' // 10 seconds
        })

        setTimeout(() => {
            connection.close();
            process.exit(0)
        }, 500)
    } catch (error) {
        console.error(error)
    }
}

runProducer().then(rs => console.log(rs)).catch(console.error)

