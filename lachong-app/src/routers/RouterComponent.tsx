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
import SidebarStore from "../components/layout/SidebarStore";
import SidebarCustomer from "../components/layout/SidebarCustomer";
import Post from "../pages/Home/Post";


export default function RouterComponent() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/community" element={<Layout><Post /></Layout>} />
            <Route path="/product" element={<Layout><Product /></Layout>} />
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
        </Routes>
    );
}