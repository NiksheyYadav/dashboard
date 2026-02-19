export function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-IN").format(value);
}

export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

export function formatTrend(value: number): string {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function truncateName(name: string): string {
    const parts = name.split(" ");
    if (parts.length < 2) return name.toUpperCase();
    return `${parts[0].toUpperCase()} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
