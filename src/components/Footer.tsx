import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

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
                        {t("footer_desc")}
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: "var(--foreground)", marginBottom: 12, fontWeight: 700 }}>{t("f_quick_links")}</h4>
                    {[
                        { href: "/", label: t("nav_home") },
                        { href: "/energy-deficit", label: t("nav_energy") },
                        { href: "/government", label: t("nav_gov") },
                        { href: "/marketplace", label: t("nav_market") },
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
                    <h4 style={{ color: "var(--foreground)", marginBottom: 12, fontWeight: 700 }}>{t("f_resources")}</h4>
                    {[
                        { href: "/about", label: t("f_about") },
                        { href: "/contact", label: t("f_contact") },
                        { href: "/faq", label: t("nav_faq") },
                        { href: "/legal", label: t("f_privacy") },
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
                    <h4 style={{ color: "var(--foreground)", marginBottom: 12, fontWeight: 700 }}>{t("f_contact")}</h4>
                    <p style={{ marginBottom: 4 }}>📧 support@urjalink.in</p>
                    <p style={{ marginBottom: 4 }}>📞 +91-6350130369</p>
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
                {t("copy_right")}
            </div>
        </footer>
    );
}
