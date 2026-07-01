import React, { useEffect, useState } from "react";
import { orderService } from "../../services/OrderService";
import { Order } from "../../models/Order";
import Translate from "../../components/Translate";
import { showErrorPopup, showLoadingPopup, hideLoadingPopup, showSuccessPopup } from "../../utils/popupUtils";
import "./style.css";
import { useCart } from "../../contexts/CartContext";
import { Protected } from "../../components/Protected";
import TableSelector from "../Cart/TableSelector";
import { Icon } from "@mui/material";
import { PointOfSale, ShoppingCart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ViewReceiptPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const { addToCart } = useCart();
    const [selectedTable, setSelectedTable] = useState<number | undefined>(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrderHistory(selectedTable);
    }, [selectedTable]);

    const fetchOrderHistory = async (tableId?: number) => {
        try {
            showLoadingPopup("Fetching order history...");
            const orderHistory = await orderService.getOrderHistory(tableId);
            setOrders(orderHistory);
            hideLoadingPopup();
        } catch (error) {
            console.error("Error fetching order history:", error);
            showErrorPopup("Failed to fetch order history. Please try again later.");
        }
    };

    const addOrderItemsToCart = (order: Order) => {
        order.orderItemQuantities.forEach(orderItemQuantity => {
            addToCart({
                id: orderItemQuantity.orderItem.menuItem.id,
                quantity: orderItemQuantity.quantity,
                annotations: orderItemQuantity.orderItem.annotations || ""
            });
        });
    };

    const closeServiceAndOrderTicket = async () => {
        try {
            showLoadingPopup("Closing service and ordering ticket...");
            await orderService.closeServiceAndOrderTicket(selectedTable);
            showSuccessPopup("Service closed and ticket ordered successfully!");
            navigate("/");
        } catch (error) {
            console.error("Error closing service and ordering ticket:", error);
            showErrorPopup("Failed to close service and order ticket. Please try again.");
        } finally {
            hideLoadingPopup();
        }
    };

    const handleTableSelect = (table: number) => {
        setSelectedTable(table);
    };

    return (
        <div className="receipt-view-page">
            <h1>
                <Translate translationKey="gui.seereceipt" />
            </h1>
            <Protected privilege="PLACE_ORDER_TO_OTHERS">
                <TableSelector selectedTable={selectedTable} onTableSelect={handleTableSelect} />
            </Protected>
            {orders.length === 0 ? (
                <p className="no-orders-msg">No orders found.</p>
            ) : (
                <ul className="order-list">
                    {orders.map((order) => (
                        <li key={order.id} className="order-item">
                            <div className="order-details">
                                <span className="order-info">
                                    Date: {new Date(order.createdOn).toLocaleString()}
                                </span>
                            </div>
                            <div className="order-items">
                                <ul>
                                    {order.orderItemQuantities.map((orderItemQuantity) => (
                                        <li
                                            key={orderItemQuantity.id}
                                            className="order-item-details"
                                        >
                                            <span className="item-name">
                                                <Translate
                                                    dataSet={
                                                        orderItemQuantity.orderItem.menuItem.translations
                                                    }
                                                    translationKey="name"
                                                />
                                            </span>
                                            <span className="item-info">
                                                Quantity: {orderItemQuantity.quantity}
                                            </span>
                                            <span className="item-info">
                                                Price: ${orderItemQuantity.orderItem.price}
                                            </span>
                                            <span className="item-info">
                                                Annotations:{" "}
                                                {orderItemQuantity.orderItem.annotations || "N/A"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button onClick={() => addOrderItemsToCart(order)}>
                                <Icon component={ShoppingCart}/>
                                <Translate translationKey="gui.addtocart" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={closeServiceAndOrderTicket} disabled={!orders || orders.length === 0}>
                <Icon component={PointOfSale}/>
                <Translate translationKey="gui.closeServiceAndOrderTicket" />
            </button>
        </div>
    );
};

export default ViewReceiptPage;