import { useEffect, useState } from "react";
import { wishListService } from "../../services/wishList.service";
import { Link } from "react-router-dom";
import Icon from "../../components/common/icons/Icon";
import "../../assets/styles/WishList.css";

export default function WishList() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        wishListService.getWishList()
            .then((res: any) => {
                const arr = res?.data?.products;
                if (Array.isArray(arr)) {
                    setProducts(arr.filter(p => p && typeof p === "object" && p._id));
                } else {
                    setProducts([]);
                }
            })
            .catch(() => setError("Không thể tải danh sách yêu thích"))
            .finally(() => setLoading(false));
    }, []);


    const handleRemove = async (productId: string) => {
        try {
            await wishListService.removeFromWishList(productId);
            setProducts((prev) => prev.filter((p) => p && p._id !== productId));
        } catch {
            setError("Không thể xóa sản phẩm khỏi danh sách");
        }
    };

    const handleClear = async () => {
        try {
            await wishListService.clearWishList();
            setProducts([]);
        } catch {
            setError("Không thể xóa toàn bộ danh sách");
        }
    };

    if (loading) return <div>Đang tải danh sách yêu thích...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div className="wishlist-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 20
                }}>
                    Danh sách sản phẩm yêu thích
                </h2>
                {products.length > 0 && (
                    <button onClick={handleClear} style={{ background: "none", border: "none", color: "#000000", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} title="Xóa tất cả">
                        <Icon name="trash" size={20} /> Xóa tất cả
                    </button>
                )}
            </div>
            {
                products.length === 0 ? (
                    <div>Chưa có sản phẩm yêu thích nào.</div>
                ) : (
                    <div className="wishlist-grid">
                        {products.map((p) => (
                            p && p._id ? (
                                <div key={p._id} className="wishlist-item" style={{ position: "relative" }}>
                                    <button
                                        onClick={() => handleRemove(p._id)}
                                        title="Xóa khỏi danh sách"
                                    >
                                        <Icon name="trash" size={18} />
                                    </button>
                                    <Link to={`/product/detail?id=${p._id}`}>
                                        <img src={p.imageUrl || p.image || "https://via.placeholder.com/120x120?text=No+Image"} alt={p.productName || p.name || "Sản phẩm"} />
                                        <div>{p.productName || p.name || "Sản phẩm"}</div>
                                    </Link>
                                </div>
                            ) : null
                        ))}
                    </div>
                )
            }
        </div >
    );
}
