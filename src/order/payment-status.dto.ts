class AmountPayment {
    value:string
    currency_code: string
    breakdown:{
        item_total: {
            currency_code: string,
            value: number,
        },
    }
}

class ItemsPayment {
    items: {
        name: string,
        description: string,
        quantity: number,
        unit_amount: {
            currency_code: string,
            value: number,
        }
}
}

class ArrayPurchase_units {
    amount:AmountPayment
    items:ItemsPayment

}

class ObjectPayment{
    id:string
    intent:string
    status:string
    purchase_units:ArrayPurchase_units[]
    eated_at:string
    expires_at:string
}

export class PaymentStatusDto {
    event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
    | 'refund.succeeded'
    type:string
    object:ObjectPayment
}