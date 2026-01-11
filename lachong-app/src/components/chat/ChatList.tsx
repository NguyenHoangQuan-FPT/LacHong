
import { useEffect, useState } from "react";
import { messageService } from "../../services/message.service";
import ChatBoxCustomer from "./ChatBoxCustomer";
import "../../assets/styles/ChatList.css";

function getCurrentUserId() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
        const user = JSON.parse(userStr);
        return user?._id || null;
    } catch {
        return null;
    }
}

export default function ChatList() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        setCurrentUserId(getCurrentUserId());
        messageService.getRoomByCustomer()
            .then(res => setRooms(res.data || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const body = document.body;
        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
        };
    }, []);

    if (loading) return <div>Đang tải danh sách chat...</div>;

    return (
        <div className="chat-list-page">
            <div className="chat-list-sidebar">
                <h2>Danh sách cuộc trò chuyện</h2>

                <ul className="chat-list-ul">
                    {rooms.map(room => (
                        <li
                            key={room._id}
                            className={
                                "chat-list-item" +
                                (selectedRoom?._id === room._id ? " active" : "")
                            }
                            onClick={() => setSelectedRoom(room)}
                        >
                            <img
                                src={room.store?.avatar || "https://via.placeholder.com/40"}
                                alt="avatar"
                                className="chat-list-avatar"
                            />
                            <div>
                                <div className="chat-list-store-name">
                                    {room.store?.storeName || "Cửa hàng"}
                                </div>
                                <div className="chat-list-subtitle">
                                    Bấm để xem chi tiết
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-list-content">
                {rooms.length === 0 ? (
                    <div className="chat-list-empty">Bạn chưa có cuộc trò chuyện nào.</div>
                ) : selectedRoom && currentUserId ? (
                    <ChatBoxCustomer
                        key={selectedRoom._id}
                        roomId={selectedRoom._id}
                        currentUserId={currentUserId}
                        store={selectedRoom.store}
                    />
                ) : (
                    <div className="chat-list-placeholder">

                    </div>
                )}
            </div>
        </div>
    );
}