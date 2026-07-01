import axios from "axios";
import { API_HOST } from "./conts";
import { getAxiosConfig } from "../utils/authUtils";
import { ErrorMessage } from "../utils/popupUtils";
import { Table } from "../models/Table";

class TableService {
    protected baseUrl = `${API_HOST}/tables`;

    async all(): Promise<Table[]> {
        try {
            const response = await axios.get<Table[]>(this.baseUrl, getAxiosConfig());
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error fetching tables:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

}

export const tableService = new TableService();