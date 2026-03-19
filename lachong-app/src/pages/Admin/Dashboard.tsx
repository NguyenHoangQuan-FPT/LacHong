import { useEffect, useMemo, useState } from "react";
import "../../assets/styles/Dashboard.css";
import customerService from "../../services/customer.service";
import categoryService from "../../services/category.service";
import materialService from "../../services/material.service";
import { storeService } from "../../services/store.service";
import { typeStoreService } from "../../services/typeStore.service";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Store = {
    _id: string;
    storeName?: string;
    emailStore?: string;
    status?: "PENDING" | "ACTIVE" | "INACTIVE";
    createdAt?: string;
};

function extractArrayLength(res: any, preferredKeys: string[] = []) {
    const data = res?.data;
    const candidates: any[] = [data];

    if (data && typeof data === "object") {
        for (const key of preferredKeys) candidates.push((data as any)[key]);
        candidates.push((data as any).data);
    }

    for (const c of candidates) {
        if (Array.isArray(c)) return c.length;
    }
    return 0;
}

function extractArray<T = any>(res: any, preferredKeys: string[] = []): T[] {
    const data = res?.data;
    const candidates: any[] = [data];

    if (data && typeof data === "object") {
        for (const key of preferredKeys) candidates.push((data as any)[key]);
        candidates.push((data as any).data);
    }

    for (const c of candidates) {
        if (Array.isArray(c)) return c as T[];
    }
    return [];
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [stats, setStats] = useState({
        users: 0,
        stores: 0,
        categories: 0,
        materials: 0,
        typeStores: 0,
    });
    const [storesList, setStoresList] = useState<Store[]>([]);

    const formatNumber = useMemo(() => {
        return (n: number) => n.toLocaleString("vi-VN");
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchStats = async () => {
            setLoading(true);
            setError("");
            try {
                const [customersRes, storesRes, categoriesRes, materialsRes, typeStoresRes] = await Promise.all([
                    customerService.getAllCustomers(),
                    storeService.getAllStores(),
                    categoryService.getCategories(),
                    materialService.getMaterials(),
                    typeStoreService.getAllTypeStores(),
                ]);

                const users = extractArrayLength(customersRes, ["customers"]);
                const stores = extractArrayLength(storesRes, ["stores"]);
                const categories = extractArrayLength(categoriesRes, ["categories"]);
                const materials = extractArrayLength(materialsRes, ["materials"]);
                const typeStores = extractArrayLength(typeStoresRes, ["typeStores"]);

                const storesList = extractArray<Store>(storesRes, ["stores"]);

                if (!isMounted) return;

                setStats({ users, stores, categories, materials, typeStores });
                setStoresList(storesList);
            } catch (e) {
                if (!isMounted) return;
                setError("Không thể tải thống kê. Vui lòng thử lại.");
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        fetchStats();
        return () => {
            isMounted = false;
        };
    }, []);

    const renderValue = (value: number) => (loading ? "..." : formatNumber(value));

    const storeJoinedChart = useMemo(() => {
        const now = new Date();

        const months: { key: string; label: string }[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            months.push({ key: `${yyyy}-${mm}`, label: `${mm}/${yyyy}` });
        }

        const counts = new Map<string, number>();
        for (const s of storesList) {
            if (!s?.createdAt) continue;
            const d = new Date(s.createdAt);
            if (Number.isNaN(d.getTime())) continue;
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const key = `${yyyy}-${mm}`;
            counts.set(key, (counts.get(key) || 0) + 1);
        }

        const labels = months.map(m => m.label);
        const data = months.map(m => counts.get(m.key) || 0);

        return {
            data: {
                labels,
                datasets: [
                    {
                        label: "Cửa hàng tham gia",
                        data,
                        borderColor: "#4f46e5",
                        backgroundColor: "rgba(79, 70, 229, 0.15)",
                        tension: 0.35,
                        fill: true,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: "rgba(0,0,0,0.06)" },
                    },
                    x: {
                        grid: { display: false },
                    },
                },
            } satisfies ChartOptions<"line">,
        };
    }, [storesList]);

    return (
        <div className="admin-dashboard">
            <h2 className="page-title">Dashboard</h2>

            {error && (
                <div style={{ marginBottom: 12, color: "#b91c1c", fontWeight: 500 }}>{error}</div>
            )}

            <div className="dashboard-stats">
                <div className="stat-card stat-card1">
                    <p>Tổng người dùng</p>
                    <h3>{renderValue(stats.users)}</h3>
                </div>

                <div className="stat-card stat-card2">
                    <p>Tổng cửa hàng</p>
                    <h3>{renderValue(stats.stores)}</h3>
                </div>

                <div className="stat-card stat-card3">
                    <p>Tổng danh mục</p>
                    <h3>{renderValue(stats.categories)}</h3>
                </div>

                <div className="stat-card stat-card4">
                    <p>Tổng chất liệu</p>
                    <h3>{renderValue(stats.materials)}</h3>
                </div>

                <div className="stat-card stat-card5">
                    <p>Tổng loại cửa hàng</p>
                    <h3>{renderValue(stats.typeStores)}</h3>
                </div>
            </div>

            <div className="dashboard-box">
                <h3>Cửa hàng tham gia theo thời gian</h3>

                <div className="dashboard-chart" style={{ height: 320 }}>
                    {loading ? (
                        <div>Đang tải...</div>
                    ) : (
                        <Line data={storeJoinedChart.data} options={storeJoinedChart.options} />
                    )}
                </div>
            </div>
        </div>
    );
}
