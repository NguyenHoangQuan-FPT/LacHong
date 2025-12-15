import { useState } from "react";
import { useParams } from "react-router-dom";
import "../../assets/styles/SidebarStore.css";
import StorePage from "../../pages/Home/StorePage";
import ProductStore from "../../pages/Home/ProductStore";

export default function SidebarStore() {
    const { id: storeId } = useParams<{ id?: string }>();
    const [activeTab, setActiveTab] = useState<"info" | "products">("info");

    return (
        <div className="sidebar-store-page">
            <div className="sidebar-store-container">
                {/* Sidebar bên trái */}
                <div className="sidebar-store-left">
                    <h2 className="sidebar-store-title">Thông tin cửa hàng</h2>

                    <div className="sidebar-store-menu">
                        <button
                            className={
                                "sidebar-store-tab" +
                                (activeTab === "info" ? " active" : "")
                            }
                            onClick={() => setActiveTab("info")}
                        >
                            Thông tin cửa hàng
                        </button>
                        <button
                            className={
                                "sidebar-store-tab" +
                                (activeTab === "products" ? " active" : "")
                            }
                            onClick={() => setActiveTab("products")}
                        >
                            Sản phẩm
                        </button>
                    </div>
                </div>

                {/* Nội dung bên phải */}
                <div className="sidebar-store-right">
                    {activeTab === "info" && (
                        <div className="sidebar-store-panel">
                            {storeId ? <StorePage /> : <div className="sidebar-error">Không tìm thấy ID cửa hàng</div>}
                        </div>
                    )}

                    {activeTab === "products" && (
                        <div className="sidebar-store-panel">
                            {storeId ? <ProductStore /> : <div className="sidebar-error">Không tìm thấy ID cửa hàng</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}