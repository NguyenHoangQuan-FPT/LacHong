
import React, { useEffect, useRef, useState } from "react";
import { messageService } from "../../services/message.service";
import { socket } from "../../socket/socket";
import "../../assets/styles/ChatBoxStore.css";

interface Message {
    _id: string;
    senderId: string;
    content: string;
    images?: string[];
    timestamp: string;
    senderRole: "customer" | "manager";
}

interface ChatBoxProps {
    roomId: string;
    currentUserId: string;
}

export default function ChatBoxStore({ roomId, currentUserId }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [modalImg, setModalImg] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFiles(prev => [...prev, file]);
        setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);

        // reset để lần sau chọn lại được
        e.target.value = "";
    };

    const handleRemoveImageAt = (idx: number) => {
        URL.revokeObjectURL(imagePreviews[idx]);
        setImageFiles(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    // Load old messages when roomId changes
    useEffect(() => {
        setLoading(true);
        messageService.getMessages(roomId)
            .then(res => {
                setMessages(res.data);
            })
            .catch(() => {
                setMessages([]);
            })

            .finally(() => setLoading(false));
    }, [roomId]);

    // Socket join/leave and receiveMessage
    useEffect(() => {
        const roomIdStr = String(roomId);
        socket.emit("joinRoom", roomIdStr);

        const handleReceiveMessage = (message: Message) => {
            console.log('📨 Received message from socket:', message);
            setMessages(prev => [...prev, message]);
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.emit("leaveRoom", roomIdStr);
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [roomId]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSend = async () => {
        if (!input.trim() && imageFiles.length === 0) return;

        try {
            const formData = new FormData();
            formData.append("roomId", roomId);
            formData.append("content", input);

            imageFiles.forEach(file => {
                formData.append("images", file);
            });

            await messageService.sendMessage(formData);

            setInput("");
            setImageFiles([]);
            setImagePreviews([]);
        } catch (err) {
            console.error("Send message error:", err);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSend();
    };

    return (
        <div className="chatbox-container" >
            <div className="chatbox-messages" >
                {loading ? (
                    <div>Đang tải tin nhắn...</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            style={{
                                marginBottom: 10,
                                textAlign: msg.senderRole === "manager" ? "right" : "left"
                            }}
                        >
                            <div className="chatbox-message-content">
                                {msg.content && (
                                    <div style={{
                                        display: 'inline-block',
                                        background: msg.senderRole === "manager" ? '#0084ff' : '#ffffff',
                                        color: msg.senderRole === "manager" ? '#ffffff' : '#000000',
                                        borderRadius: 8,
                                        padding: '6px 12px',
                                        maxWidth: '70%'
                                    }}>
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                            {msg.images && msg.images.length > 0 && (
                                <div className="chatbox-message-images">
                                    {msg.images.map((img: string, idx: number) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt="img"
                                            style={{
                                                maxWidth: '300px',
                                                maxHeight: '200px',
                                                cursor: 'pointer',
                                                borderRadius: 8,
                                                padding: '3px 6px',
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="chatbox-message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chatbox-input-store">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                />

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

                <button onClick={handleSend} style={{ marginLeft: 8 }}>
                    Gửi
                </button>
            </div>

            {imagePreviews.length > 0 && (
                <div style={{ padding: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {imagePreviews.map((src, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                            <img src={src} className="image-check" />
                            <button
                                onClick={() => handleRemoveImageAt(idx)}
                                className="remove-image"
                            >
                                ×
                            </button>
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

