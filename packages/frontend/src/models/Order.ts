import { MenuItem } from "./MenuItem";

export interface Order {
    id: number;
    userId: number;
    serviceId: number;
    createdOn: string;
    orderItemQuantities: OrderItemQuantity[];
}

export interface OrderItemQuantity {
    id: number
    orderItem: OrderItem,
    quantity: number
}

export interface OrderItem {
    id: number;
    menuItem: MenuItem;
    annotations: string | null;
    price: number;
    quantity: number;
}