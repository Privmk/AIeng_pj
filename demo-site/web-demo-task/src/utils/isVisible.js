export function isVisible(e) {
    // https://stackoverflow.com/a/38873788
    return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
}