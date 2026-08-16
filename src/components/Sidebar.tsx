"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/context/LanguageContext";
import {
    Map as MapIcon, Zap, PenTool, Landmark, Wrench,
    ShoppingCart, Info, Mail, HelpCircle, FileText,
    Sun, Moon, Globe
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/", icon: <MapIcon size={18} />, labelKey: "nav_home" },
    { href: "/analytics", icon: <Globe size={18} />, labelKey: "nav_analytics" },
    { href: "/marketplace", icon: <Zap size={18} />, labelKey: "nav_market" },
    { href: "/store", icon: <ShoppingCart size={18} />, labelKey: "nav_store" },
    { href: "/dashboard", icon: <MapIcon size={18} />, labelKey: "nav_dashboard" },
    { href: "/energy-deficit", icon: <Zap size={18} />, labelKey: "nav_energy" },
    { href: "/agency", icon: <Wrench size={18} />, labelKey: "nav_agency" },
    { href: "/government", icon: <Landmark size={18} />, labelKey: "nav_gov" },
    { href: "/maintenance", icon: <PenTool size={18} />, labelKey: "nav_maintenance" },
    { href: "/about", icon: <Info size={18} />, labelKey: "nav_about" },
    { href: "/contact", icon: <Mail size={18} />, labelKey: "nav_contact" },
    { href: "/faq", icon: <HelpCircle size={18} />, labelKey: "nav_faq" },
    { href: "/legal", icon: <FileText size={18} />, labelKey: "nav_legal" },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const lastScrollY = useRef(0);
    const { theme, toggleTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const pathname = usePathname();

    const isMainPage = pathname === "/" || pathname === "/map";

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
                setIsNavVisible(false); // scrolling down
            } else if (currentScrollY < lastScrollY.current) {
                setIsNavVisible(true); // scrolling up
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <nav className="top-navbar-container" style={{
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s",
                transform: `translateX(-50%) translateY(${isNavVisible ? "0px" : "-120px"})`,
                opacity: isNavVisible ? 1 : 0,
                pointerEvents: "none",
                zIndex: 10001, /* Ensure nav is always over everything except search input */
                maxWidth: "calc(100vw - 24px)" /* Reduce padding on small devices */
            }}>
                {/* Brand */}
                <Link href="/" style={{ textDecoration: "none", pointerEvents: "auto", flexShrink: 0 }}>
                    <h2 style={{ fontSize: "clamp(15px, 4vw, 18px)", fontWeight: 800, margin: 0, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 6 }}>
                        <img src="/circular-logo.png" alt="Urja-Link" style={{ width: "1.4em", height: "1.4em", objectFit: "cover", flexShrink: 0, borderRadius: "50%" }} /> Urja-Link
                    </h2>
                </Link>

                {/* Nav Links Removed as requested by user -> Moved to Hamburger */}
                <div style={{ flex: 1 }} />

                {/* Nav Right (Buttons & Hamburger) */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
                    <div className="nav-links-center" style={{ gap: 8 }}>
                        <button onClick={toggleTheme} style={{ background: "transparent", border: "1px solid var(--card-border)", color: "var(--foreground)", padding: "6px 12px", borderRadius: 100, display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} <span>{theme === "dark" ? "Light" : "Dark"}</span>
                        </button>
                        <button onClick={() => setLanguage(language === "en" ? "hi" : "en")} style={{ background: "transparent", border: "1px solid var(--card-border)", color: "var(--foreground)", padding: "6px 12px", borderRadius: 100, display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                            <Globe size={14} /> <span>{language === "en" ? "HI" : "EN"}</span>
                        </button>
                    </div>

                    {/* Hamburger Toggle - In Nav Pill (Only on Home/Map) */}
                    {isMainPage && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                width: 36, height: 36, borderRadius: 8,
                                border: "1px solid var(--card-border)", background: "var(--card-bg)",
                                color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", transition: "all 0.2s", flexShrink: 0
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{isOpen ? "✕" : "☰"}</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Global Sticky Hamburger (For inner pages, positioned top-right permanently) */}
            {!isMainPage && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        position: "fixed", top: 24, right: 24, zIndex: 10001,
                        width: 44, height: 44, borderRadius: "50%",
                        border: "1px solid var(--card-border)", background: "var(--card-bg)",
                        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                        color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.1)"
                    }}
                >
                    <span style={{ fontSize: 20, transition: "transform 0.3s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
                        {isOpen ? "✕" : "☰"}
                    </span>
                </button>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 9999,
                        backdropFilter: "blur(4px)",
                        animation: "fadeIn 0.2s ease",
                    }}
                />
            )}

            {/* Sidebar Panel (right side) */}
            <nav
                style={{
                    position: "fixed",
                    top: 0,
                    right: isOpen ? 0 : -320,
                    width: 300,
                    height: "100vh",
                    zIndex: 10000,
                    background: "var(--sidebar-bg)",
                    borderLeft: "1px solid var(--card-border)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isOpen ? "-8px 0 40px rgba(0,0,0,0.4)" : "none",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                <div style={{
                    height: "92px",
                    flexShrink: 0,
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid var(--card-border)",
                    boxSizing: "border-box"
                }}>
                    <h2 style={{
                        fontSize: 20, fontWeight: 800, margin: 0,
                        color: "var(--foreground)", display: "flex", alignItems: "center", gap: 6
                    }}>
                        <img src="/circular-logo.png" alt="Urja-Link" style={{ width: "1.4em", height: "1.4em", objectFit: "cover", flexShrink: 0, borderRadius: "50%" }} /> Urja-Link
                    </h2>
                </div>

                {/* Auth Buttons */}
                <div style={{ padding: "12px 20px", display: "flex", gap: 8 }}>
                    <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        style={{
                            flex: 1, padding: "8px", borderRadius: 8,
                            border: "1px solid var(--card-border)", background: "transparent",
                            color: "var(--accent)", textDecoration: "none", textAlign: "center",
                            fontSize: 13, fontWeight: 600,
                        }}
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        style={{
                            flex: 1, padding: "8px", borderRadius: 8, border: "none",
                            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                            color: "white", textDecoration: "none", textAlign: "center",
                            fontSize: 13, fontWeight: 600,
                        }}
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Navigation */}
                <div style={{ flex: 1, padding: "8px 12px" }}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "12px 12px", borderRadius: 10,
                                textDecoration: "none", color: "var(--foreground)",
                                fontSize: 14, fontWeight: 500,
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24 }}>{item.icon}</span>
                            {/* @ts-ignore */}
                            {t(item.labelKey)}
                        </Link>
                    ))}
                </div>


                {/* Footer */}
                <div style={{
                    padding: "16px 20px", borderTop: "1px solid var(--card-border)",
                    fontSize: 11, color: "var(--text-muted)", textAlign: "center",
                }}>
                    © Urja-Link 2026. All Rights Reserved.
                </div>
            </nav>
        </>
    );
}
