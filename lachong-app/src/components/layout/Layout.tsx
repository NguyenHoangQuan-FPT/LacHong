import React from "react";
import Header from "../layout/Header";
import Footer from "./Footer";
import "../../assets/styles/Layout.css";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="layout-container">
            <Header />
            <main className="main-content">{children}
            </main >
            <Footer />
        </div >
    );
}