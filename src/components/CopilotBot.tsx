"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://urja-link-api.onrender.com";

export default function CopilotBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Namaste! I am the Urja-Link AI Copilot. I can estimate localized PM Surya Ghar subsidies, analyze state grid deficits, or answer questions about your rooftop geometry. How can I help you today?" }
    ]);
    const [inputData, setInputData] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputData.trim()) return;

        const newMsg: Message = { role: "user", content: inputData };
        setMessages(prev => [...prev, newMsg]);
        setInputData("");
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE}/api/predictive/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: inputData })
            });

            if (response.ok) {
                const data = await response.json();
                const fullResponse = data.reply || "No response generated.";

                // Start appending the actual response chunk by chunk like a real chatbot
                setIsTyping(false);
                setMessages(prev => [...prev, { role: "assistant", content: "" }]);

                let i = 0;
                const streamInterval = setInterval(() => {
                    setMessages(prev => {
                        const next = [...prev];
                        const lastIndex = next.length - 1;
                        next[lastIndex] = { ...next[lastIndex], content: fullResponse.substring(0, i + 1) };
                        return next;
                    });
                    i++;
                    if (i >= fullResponse.length) clearInterval(streamInterval);
                }, 18);
            } else {
                throw new Error("API Failure");
            }
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Unable to reach the Urja-Link grid systems. Please try again later." }]);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="glass-card"
                style={{
                    position: "fixed", bottom: 44, right: 20, zIndex: 10000,
                    width: 48, height: 48, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "1px solid var(--card-border)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                    background: "rgba(15, 23, 42, 0.6)", color: "var(--foreground)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
            >
                <MessageSquare size={20} color="#f59e0b" />
                <div style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, background: "#ef4444", borderRadius: "50%", border: "2px solid #000" }}></div>
            </button>
        );
    }

    return (
        <div className="glass-card" style={{
            position: "fixed", bottom: 100, right: 28, zIndex: 10000,
            width: 380, height: 550, display: "flex", flexDirection: "column",
            overflow: "hidden", borderRadius: 24,
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
            background: "rgba(9, 9, 14, 0.55)"
        }}>
            {/* Chat Header */}
            <div style={{
                padding: "20px 24px", background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(9, 9, 14, 0))",
                borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 6 }}>
                            Urja Copilot <Sparkles size={14} color="#f59e0b" />
                        </h3>
                        <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>● Online & connected to Grid</span>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <X size={20} />
                </button>
            </div>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.role === "user" ? "var(--text-secondary)" : "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: msg.role === "user" ? "#000" : "#f59e0b", flexShrink: 0 }}>
                            {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div style={{
                            padding: "12px 16px", borderRadius: 16, fontSize: 14, lineHeight: "1.5",
                            background: msg.role === "user" ? "var(--hover-bg)" : "rgba(15, 23, 42, 0.4)",
                            border: "1px solid var(--card-border)",
                            color: "var(--foreground)",
                            borderTopRightRadius: msg.role === "user" ? 4 : 16,
                            borderTopLeftRadius: msg.role === "assistant" ? 4 : 16
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                            <Bot size={14} />
                        </div>
                        <div style={{ padding: "12px 16px", borderRadius: 16, fontSize: 12, color: "var(--text-muted)", background: "rgba(15, 23, 42, 0.4)", border: "1px solid var(--card-border)", borderTopLeftRadius: 4 }}>
                            Synthesizing grid intelligence...
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSend} style={{ padding: 16, borderTop: "1px solid var(--card-border)", display: "flex", gap: 8, background: "rgba(0,0,0,0.2)" }}>
                <input
                    type="text"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder="Ask about subsidies, physics, or grid data..."
                    style={{ flex: 1, padding: "12px 16px", borderRadius: 100, border: "1px solid var(--card-border)", background: "rgba(255,255,255,0.03)", color: "var(--foreground)", fontSize: 14, outline: "none" }}
                    autoComplete="off"
                />
                <button type="submit" disabled={isTyping} style={{ width: 44, height: 44, borderRadius: "50%", background: "#f59e0b", color: "#000", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: isTyping ? "not-allowed" : "pointer", opacity: isTyping ? 0.5 : 1 }}>
                    <Send size={18} style={{ transform: "translateX(1px)" }} />
                </button>
            </form>
        </div>
    );
}
