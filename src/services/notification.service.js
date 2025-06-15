'use strict'
const { NOTI } = require('../models/notification.model')

const pushNotiToSysTem = async ({
    type = 'SHOP-001',
    receiverId = 1,
    senderId = 1,
    options = {},
}) => {
    let noti_content
    if (type === 'SHOP-001') {
        noti_content = `@@@ vừa mói thêm một sản phẩm: @@@@`
    } else if (type === 'PROMOTION-001') {
        noti_content = `@@@ vừa mới thêm một voucher: @@@@`
    }

    const newNoti = await NOTI.create({
        noti_type: type,
        noti_content,
        noti_senderId: senderId,
        noti_receiverId: receiverId,
        noti_options: options,
    })

    return newNoti
}

const listNotiByUser = async ({
    userId = 1,
    type = 'ALL',
    isRead = 0
}) => {
    const match = { noti_receiverId: userId }
    if (type !== 'ALL') {
        match['noti_type'] = type
    }

    return await NOTI.aggregate([
        {
            $match: match,
        },
        {
            $project: {
                noti_type: 1,
                noti_senderId: 1,
                noti_receiverId: 1,
                noti_content: 1,
                createdAt: 1,
                noti_options: 1,
            }
        }
    ])
}

module.exports = {
    pushNotiToSysTem,
    listNotiByUser
}