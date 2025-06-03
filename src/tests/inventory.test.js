const redisPubSubService = require('../services/redisPubsub.service');

class InventoryService {
    constructor(){
        redisPubSubService.subscribe('purchase_events', (channel, message) => {
            console.log(`Received message on channel ${channel}:`, message);
            InventoryService.updateInventory({message})
        })
    }

    static updateInventory({productId, quantity}){
        console.log(`Updated inventory ${productId} with quantity ${quantity}`);
    }
}

module.exports = new InventoryService();