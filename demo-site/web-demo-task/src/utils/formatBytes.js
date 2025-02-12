export function formatBytes(bytes, decimals = 0) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)), 10);
    const rounded = (bytes / Math.pow(1000, i)).toFixed(decimals);
    return rounded + " " + sizes[i];
}