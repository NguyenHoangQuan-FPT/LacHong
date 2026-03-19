import React from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import HomePage from "../pages/Home/HomePage";
import UserRegister from "../pages/Auth/UserRegister";
import BusinessRegister from "../pages/Auth/BusinessRegister";
import Login from "../pages/Auth/Login";
import ActiveAccount from "../pages/Auth/ActiveAccount";
import StoreRegistration from "../pages/Auth/StoreRegistration";
import Homestore from "../pages/Store/Homestore";
import StoreProducts from "../pages/Store/Product";
import AddProduct from "../pages/Store/AddProduct";
import ProductDetail from "../pages/Store/ProductDetail";
import EditProduct from "../pages/Store/EditProduct";
import ProfileStore from "../pages/Store/ProfileStore";
import StoreLayout from "../components/layout/StoreLayout";
import Product from "../pages/Product/Product";
import ProductDetails from "../pages/Product/ProductDetails";
import Cart from "../pages/Home/Cart";
import Checkout from "../pages/Home/Checkout";
import SidebarStore from "../components/sidebar/SidebarStore";
import SidebarCustomer from "../components/sidebar/SidebarCustomer";
import Post from "../pages/Home/Post";
import Stores from "../pages/Admin/Stores";
import LayoutAdmin from "../components/layout/LayoutAdmin";
import StoreDetail from "../pages/Admin/StoreDetail";
import Dashboard from "../pages/Admin/Dashboard";
import Customer from "../pages/Admin/Customer";
import CustomerDetail from "../pages/Admin/CustomerDetail";
import Categories from "../pages/Admin/Categories";
import Materials from "../pages/Admin/Materials";
import Orders from "../pages/Store/Oders";
import OrderDetail from "../pages/Store/OrderDetail";
import Notification from "../pages/Home/Notification";
import StoreNotification from "../pages/Store/StoreNotification";
import WishList from "../pages/Home/WishList";
import TypeStore from "../pages/Admin/TypeStore";
import NotificationAdmin from "../pages/Admin/NotificationAdmin";
import ProductInStore from "../pages/Admin/ProductInStore";
import ProductDetailCard from "../pages/Admin/ProductDetailCard";
import MessageStore from "../pages/Store/MessageStore";
import ChatList from "../components/chat/ChatList";
import ChatModal from "../components/chat/ChatModal";
import About from "../pages/Home/About";
import NotFound from "../pages/Home/NotFound";
import Policy from "../pages/Home/Policy";

type AppRole = "guest" | "customer" | "manager" | "admin";

const getUserRole = (): AppRole => {
    const raw = localStorage.getItem("user");
    if (!raw) return "guest";
    try {
        const user = JSON.parse(raw);
        const role = String(user?.roleId?.name || user?.role || user?.name || "customer").toLowerCase();
        if (role === "admin") return "admin";
        if (role === "manager") return "manager";
        return "customer";
    } catch {
        return "customer";
    }
};

function RequireRoles({ allow, children }: { allow: AppRole[]; children: React.ReactElement }) {
    const role = getUserRole();
    if (role === "guest") return <Navigate to="/login" replace />;
    if (!allow.includes(role)) return <Navigate to="/not-found" replace />;
    return children;
}

function ChatModalRoute() {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();

    if (!storeId) return null;

    return (
        <ChatModal
            storeId={storeId}
            open={true}
            onClose={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate("/message");
            }}
        />
    );
}


export default function RouterComponent() {
    return (
        <Routes>
            <Route path="/notification" element={<Layout><Notification /></Layout>} />
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/community" element={<Layout><Post /></Layout>} />
            <Route path="/product" element={<Layout><Product /></Layout>} />
            <Route path="/wishlist" element={<Layout><WishList /></Layout>} />
            <Route path="/product/detail" element={<Layout><ProductDetails /></Layout>} />
            <Route path="/cart" element={<Layout><Cart /></Layout>} />
            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
            <Route path="/store/:id" element={<Layout><SidebarStore /></Layout>} />
            <Route path="/customer/profile" element={<Layout><SidebarCustomer /></Layout>} />
            <Route path="/customer/orders" element={<Layout><SidebarCustomer /></Layout>} />
            <Route path="/message" element={<Layout><ChatList /></Layout>} />
            <Route path="/message/:storeId" element={<Layout><ChatModalRoute /></Layout>} />
            <Route path="/not-found" element={<Layout><NotFound /></Layout>} />
            <Route path="/policy" element={<Layout><Policy /></Layout>} />
            <Route path="/chat" element={<Layout><ChatList /></Layout>} />

            <Route path="/user-register" element={<UserRegister />} />
            <Route path="/active-account/:token" element={<ActiveAccount />} />
            <Route path="/business-register" element={<BusinessRegister />} />
            <Route
                path="/store/registration"
                element={<RequireRoles allow={["manager"]}><StoreRegistration /></RequireRoles>}
            />
            <Route path="/login" element={<Login />} />

            <Route
                path="/store"
                element={<RequireRoles allow={["manager"]}><StoreLayout><Homestore /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/products"
                element={<RequireRoles allow={["manager"]}><StoreLayout><StoreProducts /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/products/new"
                element={<RequireRoles allow={["manager"]}><StoreLayout><AddProduct /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/products/:id"
                element={<RequireRoles allow={["manager"]}><StoreLayout><ProductDetail /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/products/edit/:id"
                element={<RequireRoles allow={["manager"]}><StoreLayout><EditProduct /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/profile"
                element={<RequireRoles allow={["manager"]}><StoreLayout><ProfileStore /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/orders"
                element={<RequireRoles allow={["manager"]}><StoreLayout><Orders /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/order/:id"
                element={<RequireRoles allow={["manager"]}><StoreLayout><OrderDetail /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/notifications"
                element={<RequireRoles allow={["manager"]}><StoreLayout><StoreNotification /></StoreLayout></RequireRoles>}
            />
            <Route
                path="/store/message"
                element={<RequireRoles allow={["manager"]}><StoreLayout><MessageStore /></StoreLayout></RequireRoles>}
            />

            <Route
                path="/admin"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><Dashboard /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/stores"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><Stores /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/customers"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><Customer /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/customer/:id"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><CustomerDetail /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/store/:id"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><StoreDetail /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/categories"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><Categories /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/materials"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><Materials /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/typeStores"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><TypeStore /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/notifications"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><NotificationAdmin /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/store/product/:id"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><ProductInStore /></LayoutAdmin></RequireRoles>}
            />
            <Route
                path="/admin/store/product/detail/:id"
                element={<RequireRoles allow={["admin"]}><LayoutAdmin><ProductDetailCard /></LayoutAdmin></RequireRoles>}
            />

            <Route path="*" element={<Layout><NotFound /></Layout>} />



        </Routes >
    );
}