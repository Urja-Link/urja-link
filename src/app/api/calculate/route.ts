import { NextResponse } from 'next/server';

function getIndiaSolarFallback(lat: number) {
    let baseGhi = 4.5;
    if (lat > 28) baseGhi = 5.5;
    else if (lat > 22) baseGhi = 5.2;
    else if (lat > 15) baseGhi = 5.0;
    else if (lat > 8) baseGhi = 4.8;

    const monthlyFactors = [0.85, 0.90, 1.00, 1.10, 1.15, 0.95, 0.80, 0.82, 0.90, 0.95, 0.88, 0.82];
    const monthlyGhi = monthlyFactors.map(f => Number((baseGhi * f).toFixed(2)));

    return {
        annual_ghi_kwh_m2_day: baseGhi,
        monthly_ghi_kwh_m2_day: monthlyGhi,
    };
}

async function fetchNasaPower(lat: number, lng: number) {
    try {
        const params = "ALLSKY_SFC_SW_DWN";
        const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=${params}&community=RE&longitude=${lng}&latitude=${lat}&format=JSON`;

        // Timeout handling for fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("NASA API failed");

        const data = await res.json();
        const ghiDict = data.properties.parameter.ALLSKY_SFC_SW_DWN;
        const ann = ghiDict.ANN > 0 ? ghiDict.ANN : 4.5;

        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const monthlyGhi = months.map(m => ghiDict[m] > 0 ? ghiDict[m] : 4.5);

        return {
            annual_ghi_kwh_m2_day: ann,
            monthly_ghi_kwh_m2_day: monthlyGhi,
        };
    } catch (e) {
        console.warn("NASA fetch failed, using India fallback", e);
        return getIndiaSolarFallback(lat);
    }
}

async function fetchOpenMeteo(lat: number, lng: number) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error("OpenMeteo failed");

        const data = await res.json();
        return {
            tempC: data.current.temperature_2m ?? 30,
            cloudPct: data.current.cloud_cover ?? 30,
            windSpeed: data.current.wind_speed_10m ?? 3,
        };
    } catch (e) {
        console.warn("OpenMeteo fetch failed", e);
        return { tempC: 30, cloudPct: 30, windSpeed: 3 };
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { usable_area_sqm, system_size_kw, lat, lng } = body;

        let effectiveArea = usable_area_sqm;
        // Standard: 10 sqm = 1kW system
        const maxKwPossible = effectiveArea / 10;
        let systemKw = system_size_kw || (effectiveArea >= 30 ? 3 : 2); // basic recommendation
        systemKw = Math.min(systemKw, maxKwPossible);
        if (systemKw < 1) systemKw = 1;

        // Parallel fetch for speed
        const [nasaData, weatherData] = await Promise.all([
            fetchNasaPower(lat, lng),
            fetchOpenMeteo(lat, lng)
        ]);

        const tempLoss = Math.max(0, (weatherData.tempC - 25) * 0.004);
        const cloudLoss = Math.min(0.25, weatherData.cloudPct * 0.002);

        // Fixed losses (soiling, inverter, wiring, orientation) roughly 20%
        const fixedLosses = 0.20;
        const totalPerformanceRatio = (1 - tempLoss) * (1 - cloudLoss) * (1 - fixedLosses);

        let annualGeneration = 0;
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyDetails = [];

        for (let i = 0; i < 12; i++) {
            const gen = systemKw * nasaData.monthly_ghi_kwh_m2_day[i] * daysInMonth[i] * totalPerformanceRatio;
            annualGeneration += gen;
            monthlyDetails.push({
                month: monthNames[i],
                generation_kwh: Number(gen.toFixed(1)),
                ghi_kwh_m2_day: nasaData.monthly_ghi_kwh_m2_day[i],
                days: daysInMonth[i]
            });
        }

        const costPerKw = systemKw <= 3 ? 55000 : 50000;
        const totalCost = systemKw * costPerKw;

        let subsidy = 0;
        if (systemKw <= 2) {
            subsidy = systemKw * 30000;
        } else if (systemKw <= 3) {
            subsidy = (2 * 30000) + ((systemKw - 2) * 18000);
        } else {
            subsidy = 78000;
        }

        const netCost = totalCost - subsidy;
        const annualSavings = annualGeneration * 8.0; // 8 INR tariff
        const payback = netCost / annualSavings;

        return NextResponse.json({
            system_capacity_kw: Number(systemKw.toFixed(2)),
            annual_generation_kwh: Number(annualGeneration.toFixed(1)),
            total_cost_inr: totalCost,
            subsidy_inr: subsidy,
            net_cost_inr: netCost,
            annual_savings_inr: Math.round(annualSavings),
            payback_period_years: Number(payback.toFixed(1)),
            co2_reduction_kg_year: Number((annualGeneration * 0.82).toFixed(1)),

            environmental_data: {
                data_source: "Next.js Engine / NASA+OpenMeteo",
                current_temperature_c: weatherData.tempC,
                current_cloud_cover_pct: weatherData.cloudPct,
                current_wind_speed_m_s: weatherData.windSpeed,
                air_quality_pm25: 40 // Mocked for speed
            },
            physics_metrics: {
                daily_peak_sun_hours: Number(nasaData.annual_ghi_kwh_m2_day.toFixed(2)),
                system_performance_ratio: Number(totalPerformanceRatio.toFixed(3)),
                temperature_loss_pct: Number((tempLoss * 100).toFixed(1)),
                cloud_loss_pct: Number((cloudLoss * 100).toFixed(1)),
            },
            generation_breakdown: {
                annual_total_kwh: Number(annualGeneration.toFixed(1)),
                monthly_detail: monthlyDetails
            },
            financial_projections: {
                payback_period_years_exact: payback,
                lifetime_net_savings_inr: (annualSavings * 25) - netCost,
                year_1_savings: annualSavings
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
