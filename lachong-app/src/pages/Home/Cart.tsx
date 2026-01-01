import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from "../../services/cart.service";
import Footer from "../../components/layout/Footer";
import { toast, ToastContainer } from "react-toastify";
import "../../assets/styles/Cart.css";

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/120x100?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};

export default function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onLogout = () => {
            setCartItems([]);
            setSelectedItems(new Set());
            setError(null);
            setLoading(false);
        };

        window.addEventListener("app:logout", onLogout);
        return () => window.removeEventListener("app:logout", onLogout);
    }, []);

    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await cartService.getCart();
                console.log("Cart response:", res);

                // BE trả { cartItems: [...] }
                const items =
                    res?.data?.cartItems ??
                    res?.data?.items ??
                    [];

                console.log("Parsed cart items:", items);
                setCartItems(items);
            } catch (err: any) {
                console.error("Error fetching cart:", err);
                // if logged out / token missing, show empty cart UI instead of sticky error
                const status = err?.response?.status;
                if (status === 401 || status === 403 || !localStorage.getItem("access_token")) {
                    setCartItems([]);
                    setError(null);
                } else {
                    setError("Không tải được giỏ hàng");
                    setCartItems([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleRemove = async (cartItemId: string) => {
        try {
            await cartService.removeCartItem(cartItemId);
            setCartItems(cartItems.filter(item => item._id !== cartItemId));
            toast.success("Đã xóa sản phẩm khỏi giỏ");
        } catch (err: any) {
            console.error("Remove error:", err);
            toast.error(err?.response?.data?.message || "Không thể xóa sản phẩm");
        }
    };
    const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            const res = await cartService.updateCartItem(cartItemId, newQuantity);

            const updatedItem = res?.data?.cart;

            setCartItems(prev =>
                prev.map(item =>
                    item._id === cartItemId
                        ? (updatedItem || { ...item, quantity: newQuantity })
                        : item
                )
            );

        } catch (err: any) {
            console.error("Update error:", err);
            toast.error(err?.response?.data?.message || "Không thể cập nhật số lượng");
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm("Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;
        try {
            await cartService.clearCart();
            setCartItems([]);
            toast.success("Đã xóa toàn bộ giỏ hàng");
        } catch (err: any) {
            toast.error("Không thể xóa giỏ hàng");
        }
    };

    const handleToggleItem = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleToggleAll = () => {
        if (selectedItems.size === cartItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cartItems.map(item => item._id)));
        }
    };

    const totalPrice = cartItems.reduce((sum, item) => {
        if (!selectedItems.has(item._id)) return sum;

        const price = item.priceAtTime ?? 0;
        const discountPercent = item.discountPercentAtTime ?? 0;

        const discountedPrice =
            discountPercent > 0
                ? Math.round(price * (1 - discountPercent / 100))
                : price;

        const itemTotal = discountedPrice * (item.quantity || 1);


        return sum + itemTotal;
    }, 0);

    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-status">Đang tải giỏ hàng...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-page">
                <div className="cart-status error">{error}</div>
                <Link to="/product" className="cart-back">← Quay lại mua sắm</Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-container">
                    <div className="cart-empty">
                        <h2>Giỏ hàng của bạn trống</h2>
                        <p>Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm.</p>
                        <Link to="/product" className="cart-shop-btn">Quay lại mua sắm</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <h1 className="cart-title">Giỏ hàng của bạn</h1>

                <div className="cart-layout">
                    <div className="cart-items-section">
                        <div className="cart-select-all">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                                    onChange={handleToggleAll}
                                />
                                <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
                            </label>
                        </div>
                        {cartItems.map((item) => {
                            const product = item.productId || item.product || {};

                            const price = item.priceAtTime ?? 0;
                            const discountPercent = item.discountPercentAtTime ?? 0;

                            const discountedPrice =
                                discountPercent > 0
                                    ? Math.round(price * (1 - discountPercent / 100))
                                    : price;

                            const itemTotal =
                                discountedPrice * (item.quantity || 1);

                            console.log(`Item ${item._id}:`, {
                                product,
                                price,
                                discountPercent,
                                discountedPrice,
                                itemTotal,
                            });

                            return (
                                <div key={item._id} className="cart-item">
                                    <div className="cart-item-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item._id)}
                                            onChange={() => handleToggleItem(item._id)}
                                        />
                                    </div>
                                    <Link
                                        to={`/product/detail?id=${product._id}`}
                                        className="cart-item-image"
                                    >
                                        <img
                                            src={normalizeImageUrl(
                                                product.imageUrl ||
                                                product.image ||
                                                item.imageUrl ||
                                                item.image
                                            )}
                                            alt={
                                                product.productName ||
                                                product.name ||
                                                item.productName ||
                                                item.name
                                            }
                                        />
                                    </Link>

                                    <div className="cart-item-details">
                                        <Link
                                            to={`/product/detail?id=${product._id}`}
                                            className="cart-item-name"
                                        >
                                            {product.productName ||
                                                product.name ||
                                                item.productName ||
                                                item.name}
                                        </Link>
                                        <div className="cart-item-prices">
                                            {discountPercent > 0 ? (
                                                <>
                                                    <span className="price-old">
                                                        {price.toLocaleString()} VND
                                                    </span>
                                                    <span className="price-new">
                                                        {discountedPrice.toLocaleString()} VND
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="price-new">
                                                    {price.toLocaleString()} VND
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="cart-item-controls">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        item._id,
                                                        item.quantity - 1
                                                    )
                                                }
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e =>
                                                    handleUpdateQuantity(
                                                        item._id,
                                                        Number(e.target.value)
                                                    )
                                                }
                                                readOnly
                                            />
                                            <button
                                                onClick={() =>
                                                    handleUpdateQuantity(
                                                        item._id,
                                                        item.quantity + 1
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item-total">
                                            {itemTotal.toLocaleString()} VND
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item._id)}
                                            className="cart-item-remove"
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="cart-summary">
                        <h3>Tóm tắt đơn hàng</h3>
                        <div className="summary-row">
                            <span>Tổng tiền hàng:</span>
                            <span>{totalPrice.toLocaleString()} VND</span>
                        </div>
                        <div className="summary-row">
                            <span>Số sản phẩm đã chọn:</span>
                            <span>{selectedItems.size} / {cartItems.length}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-total">
                            <span>Tổng cộng:</span>
                            <span>{totalPrice.toLocaleString()} VND</span>
                        </div>
                        <button
                            className="cart-checkout-btn"
                            disabled={selectedItems.size === 0}
                            onClick={() => {
                                if (selectedItems.size === 0) return;
                                const ids = Array.from(selectedItems);
                                navigate('/checkout', { state: { ids } });
                            }}
                        >
                            Tiến hành thanh toán ({selectedItems.size})
                        </button>
                        <button onClick={handleClearCart} className="cart-clear-btn">
                            Xóa tất cả
                        </button>
                        <Link to="/product" className="cart-continue-btn">
                            ← Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>

            <ToastContainer toastStyle={{ color: "white" }} autoClose={1000} />
        </div>
    );
}