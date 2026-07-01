import axios from "axios";
import { API_HOST } from "./conts";
import { getAxiosConfig } from "../utils/authUtils";
import { ErrorMessage } from "../utils/popupUtils";

interface UploadImageResponseDTO {
    url: string;
}
class ImageService {
    protected baseUrl = `${API_HOST}/files`;

    async uploadImage(file: File): Promise<UploadImageResponseDTO> {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axios.post<UploadImageResponseDTO>(`${this.baseUrl}/upload`, formData, getAxiosConfig());
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error uploading image:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

    getImageUrl(filename: string): string {
        return `${this.baseUrl}/${filename}`;
    }
}
export const imageService = new ImageService();
