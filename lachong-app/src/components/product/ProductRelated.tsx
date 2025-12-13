import React, { useEffect, useMemo, useState } from "react";
import { productService } from "../../services/product.service";
import ProductCard, { type ProductItem } from "./ProductCard";
import "../../assets/styles/ProductRelated.css";

interface ProductRelatedProps {
    product: ProductItem | null;
    currentCategoryId: string | null;
}

export default function ProductRelated({ product, currentCategoryId }: ProductRelatedProps) {
    const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!product || !currentCategoryId) {
            setRelatedProducts([]);
            return;
        }

        let mounted = true;

        const fetchRelated = async () => {
            setLoading(true);
            try {
                const productId = product._id || (product as any).id;
                console.log("[ProductRelated] Fetching - categoryId:", currentCategoryId, "productId:", productId);

                const res = await productService.getRelatedProducts(currentCategoryId, productId);
                console.log("[ProductRelated] Response:", res);

                const list: ProductItem[] = res?.data?.relatedProducts ?? res?.data?.products ?? res?.data?.data ?? [];
                console.log("[ProductRelated] List:", list);

                if (mounted) setRelatedProducts(list.slice(0, 5));
            } catch (err) {
                console.error("[ProductRelated] fetch error:", err);
                try {
                    const res = await productService.getAllProducts();
                    const allProducts = res?.data?.products ?? res?.data ?? [];
                    const filtered = allProducts
                        .filter((p: ProductItem) => {
                            if (!p || p._id === product._id || (p as any).id === (product as any).id) return false;
                            const pCateId = p.category?._id || p.category?.id || p.category;
                            return pCateId === currentCategoryId;
                        })
                        .slice(0, 5);
                    if (mounted) setRelatedProducts(filtered);
                } catch (fallbackErr) {
                    console.error("[ProductRelated] fallback error:", fallbackErr);
                    if (mounted) setRelatedProducts([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchRelated();

        return () => {
            mounted = false;
        };
    }, [product, currentCategoryId]);

    return (
        <div className="product-related">
            <div className="related-header">
                <h2>Sản phẩm liên quan</h2>
            </div>
            {loading ? (
                <div className="related-status">Đang tải sản phẩm liên quan...</div>
            ) : relatedProducts.length === 0 ? (
                <div className="related-status">Chưa có gợi ý phù hợp.</div>
            ) : (
                <div className="related-grid">
                    {relatedProducts.map((item) => (
                        <ProductCard key={item._id || item.id} product={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
