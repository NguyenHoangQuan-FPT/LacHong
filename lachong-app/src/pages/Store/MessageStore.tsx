
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { messageService } from "../../services/message.service";
import ChatBoxStore from "../../components/chat/ChatBoxStore";
import "../../assets/styles/ChatBoxStore.css";
import "../../assets/styles/MessageStore.css";

export default function MessageStore() {
    const navigate = useNavigate();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

    useEffect(() => {
        const storeStr = localStorage.getItem("store");
        if (!storeStr) {
            navigate("/login");
            return;
        }
        try {
            const store = JSON.parse(storeStr);
            setCurrentUserId(store._id || store.id || null);
            messageService.getRoomByStore().then((res: any) => {
                setRooms(res.data || []);
            }).finally(() => setLoading(false));
        } catch {
            navigate("/login");
        }
    }, [navigate]);

    const uniqueRooms = rooms.filter(
        (room, idx, arr) =>
            arr.findIndex(r => r.customer?._id === room.customer?._id) === idx
    );
    if (!currentUserId || loading) return <div>Đang tải danh sách khách hàng...</div>;

    return (
        <div className="message-store">
            <div className="message-store-sidebar">
                <h3 className="sidebar-title">Khách đã nhắn tin</h3>

                <ul className="customer-list">
                    {rooms.length === 0 && (
                        <li className="empty">Chưa có khách nào nhắn tin</li>
                    )}

                    {uniqueRooms.map((room) => (
                        <li key={room._id}>
                            <button
                                className={
                                    "customer-item " +
                                    (selectedRoom?._id === room._id ? "active" : "")
                                }
                                onClick={() => setSelectedRoom(room)}
                            >
                                <img
                                    src={room.customer?.avatar || "https://via.placeholder.com/32"}
                                    alt="avatar"
                                />
                                <span>{room.customer?.fullName || "Khách hàng"}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="message-store-chat">
                {selectedRoom ? (
                    <>
                        <div className="chat-header">
                            Chat với {selectedRoom.customer?.fullName || "Khách hàng"}
                        </div>
                        <ChatBoxStore
                            roomId={selectedRoom._id}
                            currentUserId={currentUserId}
                        />
                    </>
                ) : (
                    <div className="chat-placeholder">
                        Chọn khách hàng để xem tin nhắn
                    </div>
                )}
            </div>
        </div>
    );
}