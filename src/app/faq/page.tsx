"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
    {
        category: "Solar Basics",
        items: [
            {
                q: "How does Urja-Link calculate solar potential?",
                a: "We use real-time data from NASA POWER API for solar irradiance, Open-Meteo for weather conditions and air quality, and our AI model for rooftop detection. The calculation considers temperature losses, shadow analysis, dust/soiling, roof orientation, and seasonal variations to provide accurate energy generation estimates.",
            },
            {
                q: "What is the average solar potential in India?",
                a: "India receives 4-6 kWh/m²/day of solar irradiance. Rajasthan and Gujarat have the highest potential (~5.5-6.0 kWh/m²/day), while northeastern states receive less (~4.0-4.5 kWh/m²/day). Our platform provides location-specific data for your exact rooftop.",
            },
            {
                q: "How much roof space do I need for solar panels?",
                a: "Approximately 10 square meters per 1 kW of solar capacity. A typical 3 kW residential system needs about 30 sq meters, and a 5 kW system needs about 50 sq meters of shadow-free roof area.",
            },
        ],
    },
    {
        category: "PM Surya Ghar Yojana",
        items: [
            {
                q: "What is PM Surya Ghar Muft Bijli Yojana?",
                a: "It's the Government of India's flagship scheme to provide free electricity to 1 crore households through rooftop solar. The scheme provides subsidies of ₹30,000/kW for the first 2 kW and ₹18,000/kW for 2-3 kW, with a maximum subsidy of ₹78,000.",
            },
            {
                q: "Am I eligible for the subsidy?",
                a: "You're eligible if you have a residential electricity connection with a valid DISCOM account, own the property (or have consent), and have adequate shadow-free roof space. Commercial and industrial consumers are not eligible.",
            },
            {
                q: "How do I apply?",
                a: "1. Register on pmsuryaghar.gov.in 2. Apply through your local DISCOM portal 3. Get feasibility approval 4. Install through an empaneled vendor 5. Submit commissioning report 6. DISCOM inspection 7. Subsidy credited to your bank.",
            },
        ],
    },
    {
        category: "Net Metering",
        items: [
            {
                q: "What is net metering?",
                a: "Net metering allows you to export excess solar energy to the grid and receive credits on your electricity bill. When your solar panels produce more than you consume, the excess is sent to the grid and your meter runs backwards.",
            },
            {
                q: "Is net metering available in my state?",
                a: "Net metering is available in most Indian states but policies vary. Some states use net metering (full credit), others use net billing (partial credit for exports). Our calculator factors in your state's specific policy.",
            },
        ],
    },
    {
        category: "Installation & Maintenance",
        items: [
            {
                q: "How long does installation take?",
                a: "A typical residential rooftop solar installation takes 2-5 days. The overall process including approvals and inspections takes 4-8 weeks from application to commissioning.",
            },
            {
                q: "What maintenance do solar panels need?",
                a: "Solar panels need minimal maintenance — mainly periodic cleaning (once every 2-4 weeks depending on dust levels) and annual inspections. Our platform provides AI-powered maintenance scheduling and diagnostics.",
            },
            {
                q: "What is the warranty on solar panels?",
                a: "Most solar panels come with a 25-year performance warranty (guaranteeing 80% output at year 25) and a 10-12 year product warranty. Inverters typically have a 5-10 year warranty.",
            },
        ],
    },
    {
        category: "Financial",
        items: [
            {
                q: "What is the payback period for rooftop solar?",
                a: "With PM Surya Ghar subsidy, the payback period is typically 3-5 years for residential systems. Without subsidy, it's 5-7 years. This depends on your location, electricity tariff, and system size.",
            },
            {
                q: "How much can I save with solar panels?",
                a: "A 3 kW system can save ₹30,000-50,000 per year depending on your state's electricity tariff. Over the 25-year lifespan, total savings can exceed ₹10-15 lakh including tariff inflation.",
            },
        ],
    },
];

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggle = (key: string) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <Link href="/" className="back-link">← Back to Map</Link>
                <h1 className="page-title"><HelpCircle size={32} style={{ marginRight: 10 }} /> Frequently Asked Questions</h1>
                <p className="page-subtitle">Everything you need to know about rooftop solar in India</p>
            </header>

            <div className="content-section" style={{ maxWidth: 800 }}>
                {FAQ_ITEMS.map((cat) => (
                    <div key={cat.category} style={{ marginBottom: 32 }}>
                        <h2 style={{
                            fontSize: 20, fontWeight: 700, marginBottom: 16,
                            color: "var(--warning)", display: "flex", alignItems: "center", gap: 8,
                        }}>
                            {cat.category}
                        </h2>
                        {cat.items.map((faq) => {
                            const key = `${cat.category}-${faq.q}`;
                            const isOpen = openItems.has(key);
                            return (
                                <div key={key} className="faq-item">
                                    <button className="faq-question" onClick={() => toggle(key)}>
                                        <span>{faq.q}</span>
                                        <span style={{ fontSize: 18, transition: "transform 0.2s", transform: isOpen ? "rotate(45deg)" : "none" }}>
                                            +
                                        </span>
                                    </button>
                                    {isOpen && <div className="faq-answer">{faq.a}</div>}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <Footer />
        </div>
    );
}
