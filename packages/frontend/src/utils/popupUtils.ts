import { toast, ToastOptions } from 'react-toastify';

export interface ErrorMessage {
    status: number;
    error: string;
    message: string;
    path: string;
}

export const showErrorPopup = (message: string, options?: ToastOptions) => {
    toast.error(message, options);
};

export const showLoadingPopup = (message: string, options?: ToastOptions) => {
    toast.info(message, options);
};

export const hideLoadingPopup = () => {
    toast.dismiss();
};

export const showSuccessPopup = (message: string, options?: ToastOptions) => {
    toast.success(message, options);
};
