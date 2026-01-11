
import { useEffect, useState, useRef } from "react";
import { messageService } from "../../services/message.service";
import { socket } from "../../socket/socket";
import "../../assets/styles/ChatModal.css";

interface ChatModalProps {
    storeId: string;
    open: boolean;
    onClose: () => void;
}

export default function ChatModal({ storeId, open, onClose }: ChatModalProps) {
    const [room, setRoom] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [msgLoading, setMsgLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [modalImg, setModalImg] = useState<string | null>(null);

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

    useEffect(() => {
        if (!open) return;
        const userStr = localStorage.getItem("user");
        let userId = null;
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user._id) userId = user._id;
            } catch { }
        }
        setCurrentUserId(userId);
        if (!storeId) return;
        messageService
            .getRoomByCustomer()
            .then(res => {
                const rooms = res.data || [];
                let found = rooms.find((r: any) => r.store?._id === storeId);
                if (!found) {
                    found = { store: { _id: storeId } };
                }
                setRoom(found);
            })
            .finally(() => setLoading(false));
    }, [storeId, open]);

    // Load messages when room._id changes

    // Load messages when room._id changes
    useEffect(() => {
        if (!room || !room._id) return;
        setMsgLoading(true);
        messageService.getMessages(room._id)
            .then(res => setMessages(res.data))
            .catch(() => setMessages([]))
            .finally(() => setMsgLoading(false));
    }, [room?._id]);

    // Realtime: join/leave room, listen for new messages
    useEffect(() => {
        if (!room || !room._id) return;
        if (!socket.connected) socket.connect();
        socket.emit("joinRoom", room._id);
        const handleReceiveMessage = (message: any) => {
            setMessages(prev => [...prev, message]);
        };
        socket.on("receiveMessage", handleReceiveMessage);
        return () => {
            socket.emit("leaveRoom", room._id);
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [room?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && imageFiles.length === 0) return;
        try {
            const formData = new FormData();
            if (room && room._id) {
                formData.append("roomId", room._id);
            } else {
                formData.append("storeId", storeId);
            }
            formData.append("content", input);
            imageFiles.forEach(file => {
                formData.append("images", file);
            });
            const res = await messageService.sendMessage(formData);
            setInput("");
            setImageFiles([]);
            setImagePreviews([]);
            setFileInputKey(k => k + 1);
            let newRoomId = room && room._id ? room._id : (res?.data?.roomId || res?.data?.room?._id);
            if (!newRoomId && res?.data?._id) newRoomId = res.data._id;
            if (newRoomId && (!room || !room._id)) {
                setRoom((prev: any) => ({ ...prev, _id: newRoomId }));
            }
            // Reload messages
            setMsgLoading(true);
            messageService.getMessages(newRoomId || room._id)
                .then(res => setMessages(res.data))
                .catch(() => setMessages([]))
                .finally(() => setMsgLoading(false));
        } catch (err) {
            // ...handle error
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSend();
    };

    if (!open) return null;

    return (
        <div className="chat-modal-overlay">
            <div className="chat-modal-container">
                <button className="chat-modal-close" onClick={onClose}>
                    &times;
                </button>

                {loading ? (
                    <div className="chat-modal-loading">
                        Đang tải khung chat...
                    </div>
                ) : !room || !currentUserId ? (
                    <div className="chat-modal-error">
                        Không tìm thấy cửa hàng hoặc bạn chưa đăng nhập.
                    </div>
                ) : (
                    <div className="chat-modal-content">
                        <div className="chat-modal-header">
                            <h3>Chat với cửa hàng</h3>
                        </div>
                        <div className="chat-modal-messages-block">
                            <div className="chat-modal-messages" >
                                {msgLoading ? (
                                    <div>Đang tải tin nhắn...</div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div
                                            key={msg._id || idx}
                                            style={{
                                                marginBottom: 10,
                                                textAlign: msg.senderRole === "customer" ? "right" : "left"
                                            }}
                                        >
                                            {msg.content && (
                                                <div style={{
                                                    display: 'inline-block',
                                                    background: msg.senderRole === "customer" ? '#0084ff' : '#ffffff',
                                                    color: msg.senderRole === "customer" ? '#ffffff' : '#000000',
                                                    borderRadius: 8,
                                                    padding: '6px 12px',
                                                    maxWidth: '70%'
                                                }}>
                                                    {msg.content}
                                                </div>
                                            )}
                                            {msg.images && msg.images.length > 0 && (
                                                <div >
                                                    {msg.images.map((img: string, idx: number) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt="img"
                                                            onClick={() => setModalImg(img)}
                                                        />

                                                    ))}
                                                </div>
                                            )}
                                            <div className="time-message">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            {imagePreviews.length > 0 && (
                                <div className="chatbox-image-preview-list" style={{ position: 'absolute', bottom: 50, left: 8, zIndex: 10, borderRadius: 8, padding: 4, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} style={{ position: 'relative' }}>
                                            <img src={src} alt={`preview-${idx}`} className="image-check" />
                                            <button className="remove-image" onClick={() => {
                                                setImageFiles(prev => prev.filter((_, i) => i !== idx));
                                                setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                                                setFileInputKey(k => k + 1);
                                            }}>X</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {modalImg && (
                                <div
                                    className="modal-img"
                                    onClick={() => setModalImg(null)}
                                >
                                    <img
                                        src={modalImg}
                                        alt="preview"
                                        className="preview-imgs"
                                    />
                                </div>
                            )}
                            <div>
                                <input
                                    className="input-content"
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                />
                                <label style={{ marginLeft: 8, cursor: 'pointer' }}>
                                    <input
                                        key={fileInputKey}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            const files = Array.from(e.target.files || []);
                                            if (!files.length) return;
                                            const validFiles = files.filter(f => f.type.startsWith('image/'));
                                            setImageFiles(prev => [...prev, ...validFiles]);
                                            validFiles.forEach(file => {
                                                const url = URL.createObjectURL(file);
                                                setImagePreviews(prev => [...prev, url]);
                                            });
                                        }}
                                    />
                                    <span className="add-image">+</span>
                                </label>
                                <button className="submit-button" onClick={handleSend}>Gửi</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
