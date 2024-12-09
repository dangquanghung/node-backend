// 'use strict'

// const redis = require('redis')
// const { promisify } = require('util') // chuyen doi mot ham thanh ham async await
// const redisClient = redis.createClient()
// const { reservationInventory } = require('../models/repository/inventory.repo')

// const pexpire = promisify(redisClient.pexpire).bind(redisClient)
// const setnxAsync = promisify(redisClient.setnx).bind(redisClient)


// const acquireLock = async (productId, quantity, cartId) => {
//     const key = `lock_v2024_${productId}`
//     const retryTimes = 10
//     const expireTime = 3000 // 3s
//     for (let i = 0; i < retryTimes.length; i++) {
//         // tao key, ai giu key thi duoc vo thanh toan
//         const result = await setnxAsync(key, expireTime)
//         console.log(`result:::`, result)
//         if (result === 1) {
//             //thao tac voi inventory
//             const isReservation = await reservationInventory({
//                 productId, quantity, cartId
//             })
//             if (isReservation.modifiedCount) {
//                 await pexpire(key, expireTime)
//                 return key
//             }

//             return null;
//         } else {
//             await new Promise((resolve) => setTimeout(resolve, 50))
//         }

//     }
// }

// const releaselock = async keyLock => {
//     const delAsyncKey = promisify(redis.del).bind(redisClient)
//     return await delAsyncKey(keyLock)
// }

// module.exports = {
//     acquireLock,
//     releaselock
// }