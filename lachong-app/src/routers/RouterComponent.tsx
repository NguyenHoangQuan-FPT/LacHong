import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import HomePage from "../pages/Home/HomePage";
import UserRegister from "../pages/Auth/UserRegister";
import BusinessRegister from "../pages/Auth/BusinessRegister";
import Login from "../pages/Auth/Login";
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
import Notification from "../components/notification/Notification";
import StoreNotification from "../pages/Store/StoreNotification";
import WishList from "../pages/Home/WishList";
import TypeStore from "../pages/Admin/TypeStore";
import NotificationAdmin from "../pages/Admin/NotificationAdmin";
import ProductInStore from "../pages/Admin/ProductInStore";
import ProductDetailCard from "../pages/Admin/ProductDetailCard";


export default function RouterComponent() {
    return (
        <Routes>
            <Route path="/notification" element={<Layout><Notification /></Layout>} />
            <Route path="/" element={<HomePage />} />
            <Route path="/community" element={<Layout><Post /></Layout>} />
            <Route path="/product" element={<Layout><Product /></Layout>} />
            <Route path="/wishlist" element={<Layout><WishList /></Layout>} />
            <Route path="/product/detail" element={<Layout><ProductDetails /></Layout>} />
            <Route path="/cart" element={<Layout><Cart /></Layout>} />
            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
            <Route path="/store/:id" element={<Layout><SidebarStore /></Layout>} />
            <Route path="/customer/profile" element={<Layout><SidebarCustomer /></Layout>} />
            <Route path="/customer/orders" element={<Layout><SidebarCustomer /></Layout>} />

            <Route path="/user-register" element={<UserRegister />} />
            <Route path="/business-register" element={<BusinessRegister />} />
            <Route path="/login" element={<Login />} />

            <Route path="/store" element={<StoreLayout><Homestore /></StoreLayout>} />
            <Route path="/store/products" element={<StoreLayout><StoreProducts /></StoreLayout>} />
            <Route path="/store/products/new" element={<StoreLayout><AddProduct /></StoreLayout>} />
            <Route path="/store/products/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
            <Route path="/store/products/edit/:id" element={<StoreLayout><EditProduct /></StoreLayout>} />
            <Route path="/store/profile" element={<StoreLayout><ProfileStore /></StoreLayout>} />
            <Route path="/store/orders" element={<StoreLayout><Orders /></StoreLayout>} />
            <Route path="/store/order/:id" element={<StoreLayout><OrderDetail /></StoreLayout>} />
            <Route path="/store/notifications" element={<StoreLayout><StoreNotification /></StoreLayout>} />

            <Route path="/admin" element={<LayoutAdmin><Dashboard /></LayoutAdmin>} />
            <Route path="/admin/stores" element={<LayoutAdmin><Stores /></LayoutAdmin>} />
            <Route path="/admin/customers" element={<LayoutAdmin><Customer /></LayoutAdmin>} />
            <Route path="/admin/customer/:id" element={<LayoutAdmin><CustomerDetail /></LayoutAdmin>} />
            <Route path="/admin/store/:id" element={<LayoutAdmin><StoreDetail /></LayoutAdmin>} />
            <Route path="/admin/categories" element={<LayoutAdmin><Categories /></LayoutAdmin>} />
            <Route path="/admin/materials" element={<LayoutAdmin><Materials /></LayoutAdmin>} />
            <Route path="/admin/typeStores" element={<LayoutAdmin><TypeStore /></LayoutAdmin>} />
            <Route path="/admin/notifications" element={<LayoutAdmin><NotificationAdmin /></LayoutAdmin>} />
            <Route path="/admin/store/product/:id" element={<LayoutAdmin><ProductInStore /></LayoutAdmin>} />
            <Route path="/admin/store/product/detail/:id" element={<LayoutAdmin><ProductDetailCard /></LayoutAdmin>} />



        </Routes >
    );
}