
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

export default function ChatBoxStore(props: ChatBoxProps) {
    const { roomId } = props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
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

        const joinRoom = () => socket.emit("joinRoom", roomIdStr);
        if (socket.connected) {
            joinRoom();
        } else {
            socket.connect();
            socket.on("connect", joinRoom);
        }

        const handleReceiveMessage = (message: Message) => {
            setMessages(prev => {
                if (message?._id && prev.some(m => m._id === message._id)) return prev;
                return [...prev, message];
            });
        };

        socket.on("receiveMessage", handleReceiveMessage);
        return () => {
            socket.emit("leaveRoom", roomIdStr);
            socket.off("connect", joinRoom);
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [roomId]);


    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            return;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && imageFiles.length === 0) return;

        try {
            const formData = new FormData();
            formData.append("roomId", roomId);
            formData.append("content", input);

            imageFiles.forEach(file => {
                formData.append("images", file);
            });

            const res = await messageService.sendMessage(formData);
            const createdMessage: Message | undefined = res?.data?.message;
            if (createdMessage) {
                setMessages(prev => {
                    if (prev.some(m => m._id === createdMessage._id)) return prev;
                    return [...prev, createdMessage];
                });
                // Server already broadcasts after save; no client echo
            }

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
            <div className="chatbox-messages" ref={messagesContainerRef}>
                {loading ? (
                    <div>Đang tải tin nhắn...</div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderRole === "manager";
                        const bubbleColor = isMine ? '#0084ff' : '#ffffff';
                        const textColor = isMine ? '#ffffff' : '#000000';

                        return (
                            <div
                                key={msg._id}
                                style={{
                                    marginBottom: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMine ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {msg.content && (
                                    <div style={{
                                        display: 'inline-block',
                                        background: bubbleColor,
                                        color: textColor,
                                        borderRadius: 8,
                                        padding: '6px 12px',
                                        maxWidth: '70%'
                                    }}>
                                        {msg.content}
                                    </div>
                                )}

                                {msg.images && msg.images.length > 0 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isMine ? 'flex-end' : 'flex-start',
                                            gap: 4,
                                            marginTop: msg.content ? 6 : 0,
                                        }}
                                    >
                                        {msg.images.map((img: string, idx: number) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt="img"
                                                onClick={() => setModalImg(img)}
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

                                <div className="chatbox-message-time" style={{ textAlign: isMine ? 'right' : 'left' }}>
                                    {new Date((msg as any).timestamp || (msg as any).createdAt || Date.now()).toLocaleTimeString()}
                                </div>
                            </div>
                        );
                    })
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

