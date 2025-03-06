export type User = {
    id: string,
    username: string,
    role: 'admin' | 'client'
}

export type Product = {
    name: string,
    price: string | number,
    product_id: number,
    stock: number,
    description: string,
    url_img: string,
}
  
export interface Purchase {
    product_id: number
    username: string
    stockPurchased: number
    name_product: string
    url_img: string
    city: string
    country: string
    address: string
    postal_code: string
    state: string
    email: string
    purchase_id: string
    user_id: string,
    is_pending: boolean,
    is_delivered: boolean,
    created_at: string
}

export enum PurchaseTableFilter {
    NONE = '',
    LAST_DAY = 'dia',
    LAST_WEEK = 'semana',
    LAST_MONTH = 'mes',
    LAST_YEAR = 'año',
    DELIVERED = 'entregado',
    NOT_DELIVERED = 'no entregado',
    PENDING = 'pendiente',
    NOT_PENDING = 'no pendiente'
}



