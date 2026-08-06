import Link from "next/link";

export default function Footer() {
    return (
        <footer
            style={{
                background: "var(--footer-bg)",
                borderTop: "1px solid var(--card-border)",
                padding: "40px 32px 24px",
                color: "var(--text-muted)",
                fontSize: 13,
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 32,
                    marginBottom: 32,
                }}
            >
                {/* Brand */}
                <div>
                    <h3
                        style={{
                            fontSize: 18,
                            fontWeight: 800,
                            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            margin: "0 0 8px",
                        }}
                    >
                        ⚡ Urja-Link
                    </h3>
                    <p style={{ lineHeight: 1.6 }}>
                        AI-powered national platform for rooftop solar potential estimation,
                        subsidies, and smart energy planning.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: "var(--foreground)", marginBottom: 12, fontWeight: 700 }}>Quick Links</h4>
                    {[
                        { href: "/", label: "Solar Map" },
                        { href: "/energy-deficit", label: "Energy Deficit" },
                        { href: "/government", label: "Gov Dashboard" },
                        { href: "/marketplace", label: "Marketplace" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                display: "block",
                                color: "var(--text-muted)",
                                textDecoration: "none",
                                padding: "4px 0",
                                transition: "color 0.2s",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Resources */}
                <div>
                    <h4 style={{ color: "var(--foreground)", marginBottom: 12, fontWeight: 700 }}>Resources</h4>
                    {[
                        { href: "/about", label: "About Us" },
                        { href: "/contact", label: "Contact Us" },
                        { href: "/faq", label: "FAQ" },
                        { href: "/legal", label: "Privacy Policy" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                display: "block",
                                color: "var(--text-muted)",
                                textDecoration: "none",
                                padding: "4px 0",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{ color: "var(--foreground)", marginBottom: 12, fontWeight: 700 }}>Contact</h4>
                    <p style={{ marginBottom: 4 }}>📧 support@urjalink.in</p>
                    <p style={{ marginBottom: 4 }}>📞 +91-XXXXX-XXXXX</p>
                    <p>📍 India</p>
                </div>
            </div>

            {/* Copyright */}
            <div
                style={{
                    textAlign: "center",
                    paddingTop: 16,
                    borderTop: "1px solid var(--card-border)",
                    fontSize: 12,
                }}
            >
                © Urja-Link 2026. All Rights Reserved.
            </div>
        </footer>
    );
}
