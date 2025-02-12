export function parseValue(value, type) {
    switch (type) {
        case 'number':
            return Number(value);
        case 'bool':
            return value === 'true'
        default:
            return value
    }
}