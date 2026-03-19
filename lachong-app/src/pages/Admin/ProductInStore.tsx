import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import ProductCard from "../../pages/Admin/ProductCard";
import "../../assets/styles/ProductInStore.css";

export default function ProductInStore() {
    const { id } = useParams<{ id: string }>();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        storeService.getProductsByStoreId(id).then((res: any) => {
            setProducts(res?.data?.products || res?.data || []);
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Đang tải sản phẩm...</div>;

    return (
        <div className="admin-product-in-store">
            <h2>Sản phẩm của cửa hàng</h2>
            {products.length === 0 ? (
                <div>Không có sản phẩm nào.</div>
            ) : (
                <div className="admin-product-grid">
                    {products.map((p: any) => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
