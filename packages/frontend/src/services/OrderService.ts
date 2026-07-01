import axios from "axios";
import { API_HOST } from "./conts";
import { CartItem } from "../models/CartItem";
import { getAxiosConfig } from "../utils/authUtils";
import { ErrorMessage } from "../utils/popupUtils";
import { Order } from "../models/Order";
import { Service } from "../models/Service";

class OrderService {
    protected baseUrl = `${API_HOST}/order`;

    async order(data: CartItem[], table?: number): Promise<void> {
        try {
            await axios.post<void>(`${this.baseUrl}${table ? `?tableId=${table}` : ""}`, { orderItems: data }, getAxiosConfig());
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error placing order:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

    async getOrderHistory(tableId?: number): Promise<Order[]> {
        try {
            const response = await axios.get<Order[]>(`${this.baseUrl}/history${tableId ? `?tableId=${tableId}` : ""}`, getAxiosConfig());
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error fetching order history:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

    async closeServiceAndOrderTicket(tableId?: number): Promise<Service> {
        try {
            return (await axios.get<Service>(
                `${API_HOST}/services/close${tableId ? `?tableId=${tableId}` : ""}`,
                getAxiosConfig()
            )).data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error closing service and ordering ticket:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }
}

export const orderService = new OrderService();
