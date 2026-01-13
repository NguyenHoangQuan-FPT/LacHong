
import React, { useEffect, useRef, useState } from "react";
import { messageService } from "../../services/message.service";
import { socket } from "../../socket/socket";
import "../../assets/styles/ChatBoxCustomer.css";

interface Message {
    _id: string;
    senderId: string;
    content: string;
    images?: string[];
    timestamp: string;
    senderRole: "customer" | "store";
}

interface StoreInfo {
    _id: string;
    storeName?: string;
    avatar?: string;
}

interface ChatBoxProps {
    roomId?: string;
    currentUserId: string;
    store?: StoreInfo;
}

export default function ChatBoxCustomer(props: ChatBoxProps) {
    const { roomId, store } = props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [modalImg, setModalImg] = useState<string | null>(null);
    const [internalRoomId, setInternalRoomId] = useState<string | undefined>(roomId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Keep internalRoomId in sync when parent changes roomId
    useEffect(() => {
        if (roomId && roomId !== internalRoomId) {
            setInternalRoomId(roomId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFiles(prev => [...prev, file]);
        setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);

        e.target.value = "";
    };


    const handleRemoveImageAt = (idx: number) => {
        URL.revokeObjectURL(imagePreviews[idx]);
        setImageFiles(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "auto"
        });
    };

    const prevRoomId = useRef<string | undefined>(undefined);
    const prevMsgCount = useRef<number>(0);
    useEffect(() => {
        if (
            prevRoomId.current === internalRoomId &&
            messages.length - prevMsgCount.current === 1
        ) {
            scrollToBottom();
        }
        prevRoomId.current = internalRoomId;
        prevMsgCount.current = messages.length;
    }, [messages, internalRoomId]);

    // Load old messages when roomId changes
    useEffect(() => {
        if (!internalRoomId) return;
        setLoading(true);
        messageService.getMessages(internalRoomId)
            .then(res => {
                setMessages(res.data);
            })
            .catch(() => {
                setMessages([]);
            })
            .finally(() => setLoading(false));
    }, [internalRoomId]);

    useEffect(() => {
        if (!internalRoomId) return;
        const roomIdStr = String(internalRoomId);

        const joinRoom = () => socket.emit("joinRoom", roomIdStr);
        if (socket.connected) {
            joinRoom();
        } else {
            socket.connect();
            socket.on("connect", joinRoom);
        }

        const handleReceiveMessage = (message: Message) => {
            setMessages(prev => {
                if (!message?._id) return [...prev, message];
                if (prev.some(m => m._id === message._id)) return prev;
                return [...prev, message];
            });
        };

        socket.on("receiveMessage", handleReceiveMessage);
        return () => {
            socket.emit("leaveRoom", roomIdStr);
            socket.off("connect", joinRoom);
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [internalRoomId]);


    const handleSend = async () => {
        if (!input.trim() && imageFiles.length === 0) return;
        try {
            const formData = new FormData();
            if (internalRoomId) {
                formData.append("roomId", internalRoomId);
            }
            formData.append("content", input);
            imageFiles.forEach(file => {
                formData.append("images", file);
            });
            if (store?._id) {
                formData.append("storeId", store._id);
            }
            const res = await messageService.sendMessage(formData);

            const createdRoomId: string | undefined = res?.data?.roomId;
            const createdMessage: Message | undefined = res?.data?.message;

            // First message may create room => set roomId so effect will join.
            if (!internalRoomId && createdRoomId) {
                setInternalRoomId(createdRoomId);
            }

            // Optimistic append: avoid needing reload if socket event is delayed/missed on production.
            if (createdMessage) {
                setMessages(prev => {
                    if (prev.some(m => m._id === createdMessage._id)) return prev;
                    return [...prev, createdMessage];
                });
            }
            setInput("");
            setImageFiles([]);
            setImagePreviews([]);
        } catch (err) {
            console.error('Send message error:', err);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <div className="chatbox-container-customer">
            <div className="chatbox-header" >
                <img
                    src={store?.avatar || 'https://via.placeholder.com/40'}
                    alt="avatar"
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }}
                />
                <h3 style={{ margin: 0 }}>Chat với {store?.storeName || 'Cửa hàng'}</h3>
            </div>
            <div className="chatbox-customer-messages">
                {loading ? (
                    <div>Đang tải tin nhắn...</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
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
                                            style={{
                                                maxWidth: "300px",
                                                maxHeight: "200px",
                                                marginTop: 4,
                                                cursor: "pointer",
                                                borderRadius: 8,
                                                padding: '3px 6px',
                                            }}
                                        />

                                    ))}
                                </div>
                            )}
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chatbox-input">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                />
                <label style={{ marginLeft: 8, cursor: 'pointer' }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className="add-image"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        +
                    </button>

                </label>
                <button onClick={handleSend} style={{ marginLeft: 8 }}>Gửi</button>
            </div>
            {imagePreviews.length > 0 && (
                <div className="chatbox-image-preview-list">
                    {imagePreviews.map((src, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                            <img src={src} alt={`preview-${idx}`} className="image-check" />
                            <button onClick={() => handleRemoveImageAt(idx)} className="remove-image">X</button>
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
        </div>

    );
};

