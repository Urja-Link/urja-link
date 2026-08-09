"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { ScrollText, Lock, ClipboardList } from "lucide-react";

export default function LegalPage() {
    return (
        <div className="page-container">
            <header className="page-header">
                <Link href="/" className="back-link">← Back to Map</Link>
                <h1 className="page-title"><ScrollText size={32} style={{ marginRight: 10 }} /> Privacy Policy & Terms</h1>
                <p className="page-subtitle">Last updated: August 2026</p>
            </header>

            <div className="content-section" style={{ maxWidth: 800 }}>
                {/* Privacy Policy */}
                <div className="info-card" style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: "var(--warning)", display: "flex", alignItems: "center", gap: 8 }}>
                        <Lock size={24} /> Privacy Policy
                    </h2>
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)" }}>
                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>1. Information We Collect</h3>
                        <p>
                            We collect location data (latitude/longitude) when you use the solar map feature,
                            account information (name, email, phone) when you register, and usage analytics
                            to improve our services. We do not collect or store any data without your consent.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>2. How We Use Your Data</h3>
                        <p>
                            Your location data is used solely to calculate solar potential and fetch environmental
                            data from NASA POWER and Open-Meteo APIs. Account data is used for authentication
                            and to provide personalized services. We do not sell your data to third parties.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>3. Data Security</h3>
                        <p>
                            We implement industry-standard security measures including encrypted data transmission,
                            secure authentication tokens, and regular security audits to protect your information.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>4. Third-Party Services</h3>
                        <p>
                            We integrate with NASA POWER API, Open-Meteo API, and OpenStreetMap for map
                            functionality. These services have their own privacy policies. No personal data
                            is shared with these services — only anonymous location coordinates.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>5. Your Rights</h3>
                        <p>
                            You have the right to access, modify, or delete your personal data at any time.
                            Contact us at support@urjalink.in to exercise these rights.
                        </p>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="info-card">
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: "var(--warning)", display: "flex", alignItems: "center", gap: 8 }}>
                        <ClipboardList size={24} /> Terms & Conditions
                    </h2>
                    <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)" }}>
                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>1. Acceptance of Terms</h3>
                        <p>
                            By using Urja-Link India, you agree to these terms and conditions. If you do not
                            agree, please do not use the platform.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>2. Service Description</h3>
                        <p>
                            Urja-Link provides AI-powered solar potential estimation, government subsidy
                            information, and connects you with solar installers. Our calculations are estimates
                            based on available data and should be verified with a professional installer.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>3. Disclaimer</h3>
                        <p>
                            Solar generation estimates are based on historical data and AI models. Actual
                            generation may vary. Government subsidy amounts and policies are subject to change.
                            Always verify current rates with official government sources.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>4. Company Listings</h3>
                        <p>
                            Companies listed on our marketplace undergo a verification process, but Urja-Link
                            is not responsible for the quality of work performed by listed installers. Users
                            are encouraged to independently verify company credentials.
                        </p>

                        <h3 style={{ color: "var(--foreground)", margin: "16px 0 8px", fontWeight: 600 }}>5. Contact</h3>
                        <p>
                            For any questions about these terms, contact us at support@urjalink.in or visit
                            our <Link href="/contact" style={{ color: "var(--foreground)" }}>Contact page</Link>.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
