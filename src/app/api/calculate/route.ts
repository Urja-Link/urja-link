import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { usable_area_sqm, system_size_kw, lat, lng, polygon_area_sqm } = body;

        // Use internal Docker URL for local dev, or the public Render URL in production
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://backend:8000";

        console.log(`[Proxy] Forwarding calculation to ${backendUrl}/api/calculate`);

        const res = await fetch(`${backendUrl}/api/calculate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usable_area_sqm,
                system_size_kw,
                lat,
                lng,
                polygon_area_sqm
            })
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error("[Proxy] FastAPI Engine Error:", errBody);
            throw new Error(`Physics Core Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Inject a flag to prove it came from the real digital twin backend
        if (data.environmental_data) {
            data.environmental_data.is_live_production = true;
        }

        return NextResponse.json(data);

    } catch (e: any) {
        console.error("[Proxy] Server Bridge Failed:", e);
        return NextResponse.json({ error: e.message || "Failed to reach computational engine" }, { status: 500 });
    }
}
