"use client";

import { motion } from "framer-motion";
import { Sun } from "lucide-react";

export default function Loading() {
    return (
        <div style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--background)",
            zIndex: 99999,
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gradient-start)",
                }}
            >
                <Sun size={64} style={{ filter: "drop-shadow(0 0 20px var(--gradient-start))" }} strokeWidth={1.5} />
            </motion.div>
            <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ marginTop: 24, fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase" }}
            >
                Harnessing Solar Energy
            </motion.p>
        </div>
    );
}
