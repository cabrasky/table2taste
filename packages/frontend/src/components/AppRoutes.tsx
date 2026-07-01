import React, { useMemo } from "react";
import { RouteObject, RouterProvider, createBrowserRouter } from "react-router-dom";
import MenuView from "../pages/MenuView/MenuView";
import { MenuItemFormPage } from "../pages/admin/MenuItem/MenuItemFormPage";
import { MainPageLayout } from "../pages/MainPageLayout";
import CartPage from "../pages/Cart/CartPage";
import LoginForm from "./Login/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import ErrorPage from "../pages/ErrorPage";
import ViewReceiptPage from "../pages/ViewReceipt/ViewReceiptPage";
import { CategoryFormPage } from "../pages/admin/Category/CagetoryFormPage";
import { MenuItemPage } from "../pages/MenuItemView/MenuViewPage";
import TableStatusPage from "../pages/TableStatus/TablestatusPage";

const baseRoutes: RouteObject[] = [
  { index: true, element: <MenuView /> },
  { path: "login", element: <LoginForm /> },
  { path: "category/:id", element: <MenuView /> },
  { path: "menuItem/:id", element: <MenuItemPage /> },
  { path: "cart", element: <CartPage /> },
  { path: "view-receipt", element: <ViewReceiptPage /> },
  { path: "tableview", element: <TableStatusPage /> }
];

const adminRoutes: RouteObject = {
  path: "admin",
  children: [
    { index: true, element: <MenuView admin /> },
    {
      path: "category",
      children: [
        { index: true, element: <MenuView admin /> },
        { path: "add", element: <CategoryFormPage /> },
        {
          path: ":id",
          children: [
            { index: true, element: <MenuView admin /> },
            { path: "edit", element: <CategoryFormPage /> },
          ],
        },
      ],
    },
    {
      path: "menuItem",
      children: [
        { path: "add", element: <MenuItemFormPage /> },
        { path: ":id/edit", element: <MenuItemFormPage /> },
      ],
    },
  ],
};

const errorRoute: RouteObject = {
  path: "admin/*",
  element: <ErrorPage requiredGroup="admin" />,
};

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.groups.some((group) => group.id === "admin");

  const routes = useMemo(() => [
    {
      path: "/",
      element: <MainPageLayout />,
      children: [...baseRoutes, ...(isAdmin ? [adminRoutes] : [errorRoute])],
    },
  ], [isAdmin]);

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
