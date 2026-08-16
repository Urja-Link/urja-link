import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize a Server-Side Supabase client.
// Note: We use the SERVICE ROLE KEY here to bypass RLS for hardware ingestion securely.
// Ensure SUPABASE_SERVICE_ROLE_KEY is set in your Vercel/local environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        // Simple API Key authentication for hardware
        const authHeader = request.headers.get("authorization");
        const hardwareApiKey = process.env.IOT_HARDWARE_API_KEY;

        if (!hardwareApiKey) {
            return NextResponse.json({ error: "Server misconfiguration: IOT_HARDWARE_API_KEY missing" }, { status: 500 });
        }

        if (!authHeader || authHeader !== `Bearer ${hardwareApiKey}`) {
            return NextResponse.json({ error: "Unauthorized hardware." }, { status: 401 });
        }

        const body = await request.json();
        const { panel_id, voltage_v, temperature_c } = body;

        if (!panel_id || voltage_v === undefined || temperature_c === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Insert telemetry data into Supabase
        const { data, error } = await supabase
            .from("iot_telemetry")
            .insert([
                {
                    panel_id,
                    voltage_v,
                    temperature_c,
                    timestamp: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error("Supabase IoT Insert Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Telemetry recorded safely!" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
