"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Search } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function StorePage() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('store_products').select('*');
            if (data && data.length > 0) {
                setProducts(data);
            } else {
                setProducts([
                    { id: "1", name: "Urja-Link Monocrystalline Pro 400W", type: "Panel", price: 12500, rating: 4.8, image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop" },
                    { id: "2", name: "Urja-Link Poly Eco 330W", type: "Panel", price: 8900, rating: 4.5, image_url: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=600&auto=format&fit=crop" },
                    { id: "3", name: "Nexus Hybrid Inverter 5kW", type: "Inverter", price: 45000, rating: 4.9, image_url: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600&auto=format&fit=crop" },
                    { id: "4", name: "Voltaic Powerwall 10kWh", type: "Battery", price: 180000, rating: 5.0, image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop" },
                ]);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        (filter === "All" || p.type === filter) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: 100, paddingBottom: 60, paddingInline: 20 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
                            Solar Marketplace
                        </h1>
                        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Tier-1 Equipment for your National Grid connection.</p>
                    </div>
                    <Link href="/store/checkout" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--foreground)", color: "var(--background)", padding: "12px 24px", borderRadius: 12, textDecoration: "none", fontWeight: 700 }}>
                        <ShoppingCart size={18} /> Checkout
                    </Link>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 300, display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--card-border)", padding: "12px 16px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input type="text" placeholder="Search panels, inverters..." style={{ border: "none", background: "transparent", color: "var(--foreground)", width: "100%", outline: "none", fontSize: 15 }} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                        {["All", "Panel", "Inverter", "Battery"].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: "10px 20px", borderRadius: 100, border: "1px solid var(--card-border)",
                                background: filter === f ? "var(--foreground)" : "var(--card-bg)",
                                color: filter === f ? "var(--background)" : "var(--foreground)",
                                cursor: "pointer", fontWeight: 600, backdropFilter: "blur(10px)", whiteSpace: "nowrap"
                            }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                    {filteredProducts.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}
                        >
                            <div style={{ width: "100%", height: 200, borderRadius: 12, overflow: "hidden", position: "relative" }}>
                                <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: 100, display: "flex", alignItems: "center", gap: 4, color: "#fff", fontSize: 12, fontWeight: 600 }}>
                                    <Star size={12} color="var(--warning)" fill="var(--warning)" /> {product.rating}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{product.type}</p>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: "0 0 8px 0" }}>{product.name}</h3>
                                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: 0 }}>
                                    ₹{product.price.toLocaleString("en-IN")}
                                </p>
                            </div>
                            <button style={{ width: "100%", padding: 12, borderRadius: 8, background: "var(--hover-bg)", border: "1px solid var(--card-border)", color: "var(--foreground)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--card-border)"} onMouseLeave={e => e.currentTarget.style.background = "var(--hover-bg)"}>
                                <ShoppingCart size={16} /> Add to Cart
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
