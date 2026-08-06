"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

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

        const lowerq = newMsg.content.toLowerCase();

        // Simulate streaming RAG Logic
        setTimeout(() => {
            let fullResponse = "I'm analyzing the national grid data for you. Please hold...";

            if (lowerq.includes("subsidy") || lowerq.includes("mumbai") || lowerq.includes("10kw")) {
                fullResponse = "Currently, under the PM Surya Ghar Muft Bijli Yojana, a maximum subsidy of ₹78,000 is available for systems up to 3 kW capacity and above. For a 10 kW system in Mumbai (Maharashtra), the Central subsidy remains capped at ₹78,000. However, wait! I also detect you are in tier-1 commercial zone, which offers accelerated depreciation tax benefits. Would you like a precise ROI simulation?";
            } else if (lowerq.includes("dust") || lowerq.includes("maintenance")) {
                fullResponse = "Based on our machine learning prognostic models for the North-western grid, dust settlement can drop panel efficiency by 22% within 14 days of no rain. Are your panels connected to our IoT tracking module? If so, I can run a live diagnostic.";
            } else if (lowerq.includes("trading") || lowerq.includes("market") || lowerq.includes("sell")) {
                fullResponse = "The Peer-to-Peer Energy Spot Market is live! Currently, the localized demand is extremely high (92% saturation). The Spot Price is soaring near ₹10.20/kWh. This is a very optimal time to export your surplus energy!";
            } else {
                fullResponse = "I have correlated your query against 14 national datasets. The telemetry looks optimal. Can I fetch a specific state's energy deficit for you?";
            }

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
            }, 18); // 18ms per character simulating rapid human-like generation

        }, 800);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="glass-card"
                style={{
                    position: "fixed", bottom: 24, right: 28, zIndex: 10000,
                    width: 64, height: 64, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: "1px solid var(--card-border)",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                    background: "rgba(15, 23, 42, 0.6)", color: "var(--foreground)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
            >
                <MessageSquare size={24} color="#f59e0b" />
                <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, background: "#ef4444", borderRadius: "50%", border: "2px solid #000" }}></div>
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
