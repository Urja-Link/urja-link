export function formatNumber(val: any, decimals = 1, fallback = "—"): string {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return fallback;
    return Number(val).toLocaleString("en-IN", { maximumFractionDigits: decimals });
}

export function formatCurrency(val: any, fallback = "—"): string {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return fallback;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(val));
}

export function formatPercentage(val: any, fallback = "—"): string {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return fallback;
    return `${Number(val).toFixed(1)}%`;
}

export function formatEnergy(val: any, fallback = "—"): string {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return fallback;
    return `${formatNumber(val, 1)} kWh`;
}

export function formatPower(val: any, fallback = "—"): string {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return fallback;
    return `${formatNumber(val, 1)} kW`;
}
