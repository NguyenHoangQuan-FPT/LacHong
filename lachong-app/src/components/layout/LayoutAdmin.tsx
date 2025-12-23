import React from 'react';
import SidebarAdmin from '../sidebar/SidebarAdmin';
import '../../assets/styles/LayoutAdmin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-layout">
            <SidebarAdmin />

            <div className="admin-main">
                <div className="admin-content">
                    {children}
                </div>
            </div>
        </div>
    );
}