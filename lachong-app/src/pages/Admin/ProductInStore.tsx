import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { storeService } from "../../services/store.service";
import ProductCard from "../../pages/Admin/ProductCard";

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
        <div style={{ padding: 24 }}>
            <h2>Sản phẩm của cửa hàng</h2>
            {products.length === 0 ? (
                <div>Không có sản phẩm nào.</div>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    {products.map((p: any) => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
