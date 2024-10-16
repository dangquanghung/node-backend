'user strict'

const { SuccessResponse } = require('../core/success.response')
const CheckoutService = require('../services/checkout.service')


class CheckoutController {
    //new 
    checkoutReview = async (req, res, next) => {
        new SuccessResponse({
            message: 'Review checkout success!',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res)
    }

}

module.exports = new CheckoutController()