export interface Product {
    id: number
    name: string
    price: number
    image?: string
    images?: string[]
    stock: number
    quantity: number
    category?: string
    description?: string
    status?: string
    tracking_id?: string
    subcategory?: string
}
