import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../../assets/styles/SidebarCustomer.css";
import ProfileCustomer from "../../pages/Home/ProfileCustomer";
import Address from "../../pages/Home/Address";
import Order from "../../pages/Home/Order";

export default function SidebarCustomer() {
    const [activeTab, setActiveTab] = useState<"info" | "address" | "orders">("info");

    return (
        <div className="sidebar-customer-page">
            <div className="sidebar-customer-container">
                <div className="sidebar-customer-left">
                    <h2 className="sidebar-customer-title">Thông tin khách hàng</h2>

                    <div className="sidebar-customer-menu">
                        <button
                            className={
                                "sidebar-customer-tab" +
                                (activeTab === "info" ? " active" : "")
                            }
                            onClick={() => setActiveTab("info")}
                        >
                            Thông tin
                        </button>
                        <button
                            className={
                                "sidebar-customer-tab" +
                                (activeTab === "address" ? " active" : "")
                            }
                            onClick={() => setActiveTab("address")}
                        >
                            Địa chỉ
                        </button>
                        <button
                            className={
                                "sidebar-customer-tab" +
                                (activeTab === "orders" ? " active" : "")
                            }
                            onClick={() => setActiveTab("orders")}
                        >
                            Đơn hàng
                        </button>
                    </div>
                </div>

                {/* Nội dung bên phải */}
                <div className="sidebar-customer-right">
                    {activeTab === "info" && (
                        <div className="sidebar-customer-panel">
                            <ProfileCustomer />
                        </div>
                    )}

                    {activeTab === "address" && (
                        <div className="sidebar-customer-panel">
                            <Address />
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div className="sidebar-customer-panel">
                            <Order />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}