import React from 'react';
import Sidebar from './Sidebar';
import '../../assets/styles/StoreLayout.css';

interface StoreLayoutProps {
    children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
    return (
        <div className="store-layout">
            <div className="store-sidebar-wrapper">
                <Sidebar />
            </div>

            <div className="store-main-wrapper">
                {children}
            </div>
        </div>
    );
}