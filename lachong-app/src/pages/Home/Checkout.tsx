import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { cartService } from "../../services/cart.service";
import orderService from "../../services/order.service";
import { addressService } from "../../services/address.service";
import paymentService from "../../services/payment.service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/styles/Cart.css";

const normalizeImageUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/120x100?text=No+Image";
    if (/^https?:\/\//i.test(url)) return url;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || "";
    return base ? base.replace(/\/$/, "") + "/" + url.replace(/^\//, "") : url;
};

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Checkout() {
    const navigate = useNavigate();
    const query = useQuery();
    const location = useLocation();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addressList, setAddressList] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
    const [placing, setPlacing] = useState(false);

    const idsParam = query.get("ids") || "";
    const selectedIdsFromQuery = useMemo(() => idsParam.split(",").map(s => s.trim()).filter(Boolean), [idsParam]);
    const selectedIdsFromState = (location.state as any)?.ids || [];
    const selectedIds = useMemo(() => {
        if (Array.isArray(selectedIdsFromState) && selectedIdsFromState.length > 0) return selectedIdsFromState;
        return selectedIdsFromQuery;
    }, [selectedIdsFromState, selectedIdsFromQuery]);

    useEffect(() => {
        const load = async () => {
            if (selectedIds.length === 0) {
                setError("Không có sản phẩm nào được chọn để thanh toán");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const [cartRes, addrRes, payRes] = await Promise.all([
                    cartService.getCart(),
                    addressService.getAddresses(),
                    paymentService.getPaymentMethods(),
                ]);

                const items = cartRes?.data?.cartItems ?? cartRes?.data?.items ?? [];
                const filtered = Array.isArray(items)
                    ? items.filter((it: any) => selectedIds.includes(it._id))
                    : [];
                setCartItems(filtered);

                const addrs = addrRes?.data?.addresses ?? addrRes?.data ?? [];
                setAddressList(Array.isArray(addrs) ? addrs : []);
                const def = (addrs || []).find((a: any) => a.isDefault) || (addrs || [])[0];
                if (def?._id) setSelectedAddressId(def._id);

                const pm = payRes?.data?.paymentMethods ?? payRes?.data ?? [];
                setPaymentMethods(Array.isArray(pm) ? pm : []);
                const firstPm = (pm || [])[0];
                if (firstPm?._id) setSelectedPaymentId(firstPm._id);
            } catch (e: any) {
                setError(e?.response?.data?.message || "Không tải được dữ liệu thanh toán");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedIds]);

    const computeDiscounted = (item: any) => {
        const price = item.priceAtTime ?? 0;
        const discountPercent = item.discountPercentAtTime ?? 0;
        const discountedPrice = discountPercent > 0 ? Math.round(price * (1 - discountPercent / 100)) : price;
        const qty = item.quantity || 1;
        const lineTotal = discountedPrice * qty;
        return { price, discountPercent, discountedPrice, qty, lineTotal };
    };

    const subtotal = cartItems.reduce((s, it) => s + computeDiscounted(it).lineTotal, 0);
    const shipping = 0;
    const grandTotal = subtotal + shipping;

    const handlePlaceOrder = async () => {
        if (placing) return;
        if (cartItems.length === 0) {
            toast.error("Không có sản phẩm để thanh toán");
            return;
        }
        if (!selectedAddressId) {
            toast.error("Vui lòng chọn địa chỉ nhận hàng");
            return;
        }
        if (!selectedPaymentId) {
            toast.error("Vui lòng chọn phương thức thanh toán");
            return;
        }
        setPlacing(true);
        try {
            const payload = {
                cartIds: cartItems.map((it) => it._id),
                paymentMethod: selectedPaymentId,
                addressId: selectedAddressId,
            };
            const res = await orderService.createOrder(payload);
            toast.success("Đặt hàng thành công");
            setTimeout(() => navigate("/"), 3000);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Thanh toán thất bại");
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-status">Đang chuẩn bị thanh toán...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-page">
                <div className="cart-status error">{error}</div>
                <Link to="/cart" className="cart-back">← Quay lại giỏ hàng</Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <h1 className="cart-title">Xác nhận đơn hàng</h1>

                <div className="cart-layout">
                    <div className="cart-items-section">
                        {cartItems.map((item) => {
                            const product = item.productId || item.product || {};
                            const { price, discountPercent, discountedPrice, qty, lineTotal } = computeDiscounted(item);
                            return (
                                <div key={item._id} className="cart-item">
                                    <div className="cart-item-checkbox" />
                                    <Link to={`/product/detail?id=${product._id}`} className="cart-item-image">
                                        <img src={normalizeImageUrl(product.imageUrl || product.image || item.imageUrl || item.image)}
                                            alt={product.productName || product.name || item.productName || item.name} />
                                    </Link>
                                    <div className="cart-item-details">
                                        <Link to={`/product/detail?id=${product._id}`} className="cart-item-name">
                                            {product.productName || product.name || item.productName || item.name}
                                        </Link>
                                        <div className="cart-item-prices">
                                            {discountPercent > 0 ? (
                                                <>
                                                    <span className="price-old">{price.toLocaleString()} VND</span>
                                                    <span className="price-new">{discountedPrice.toLocaleString()} VND</span>
                                                </>
                                            ) : (
                                                <span className="price-new">{discountedPrice.toLocaleString()} VND</span>
                                            )}
                                            <span style={{ marginLeft: 8, color: "#64748b" }}>× {qty}</span>
                                        </div>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="cart-item-total">{lineTotal.toLocaleString()} VND</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <h3>Thông tin thanh toán</h3>
                        <div className="summary-row">
                            <span>Tạm tính:</span>
                            <span>{subtotal.toLocaleString()} VND</span>
                        </div>
                        <div className="summary-row">
                            <span>Phí vận chuyển:</span>
                            <span>{shipping.toLocaleString()} VND</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-total">
                            <span>Tổng cộng:</span>
                            <span>{grandTotal.toLocaleString()} VND</span>
                        </div>

                        <div style={{ margin: "14px 0 6px", fontWeight: 700 }}>Địa chỉ nhận hàng</div>
                        {addressList.length === 0 ? (
                            <Link to="/customer/profile" className="status-link">
                                <div className="status"><a>Thêm địa chỉ tại đây.</a></div>
                            </Link>
                        ) : (
                            <select
                                value={selectedAddressId}
                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                className="cart-select"
                                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d0d7de" }}
                            >
                                <option value="" disabled>Chọn địa chỉ giao hàng</option>
                                {addressList.map((a) => (
                                    <option key={a._id} value={a._id}>
                                        {a.address}{a.isDefault ? " (Mặc định)" : ""}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div style={{ margin: "16px 0 6px", fontWeight: 700 }}>Phương thức thanh toán</div>
                        {paymentMethods.length === 0 ? (
                            <div className="status">Chưa có phương thức thanh toán khả dụng.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {paymentMethods.map((pm) => (
                                    <label key={pm._id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={selectedPaymentId === pm._id}
                                            onChange={() => setSelectedPaymentId(pm._id)}
                                        />
                                        <span>{pm.name || pm.methodName || "Thanh toán"}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <button
                            className="cart-checkout-btn"
                            disabled={placing || cartItems.length === 0 || !selectedAddressId || !selectedPaymentId}
                            onClick={handlePlaceOrder}
                        >
                            {placing ? "Đang đặt hàng..." : "Đặt hàng"}
                        </button>
                        <Link to="/cart" className="cart-continue-btn">← Quay lại giỏ hàng</Link>
                    </div>
                </div>
            </div>
            <ToastContainer toastStyle={{ color: "white" }} />
        </div>
    );
}
