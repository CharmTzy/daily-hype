export function capitaliseWord(str: string) {
    if (str) {
        if (str.length > 0) {
            let splitStr = str.toLowerCase().split(" ");
            splitStr.forEach((word, index) => {
                splitStr[index] =
                    splitStr[index].charAt(0).toUpperCase() + splitStr[index].slice(1);
            });
            return splitStr.join(" ");
        }
    }
    return "";
}
export function formatDecimal(value: string, point: number = 1) {
    if (value)
        return parseFloat(value).toFixed(point).toString();
    else
        return "";
}
export function formatMoney(value: string) {
    if (value)
        return parseFloat(value).toFixed(2).toString();
    else
        return "";
}
export function formatDateByMonthDayYear(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
export function formatDateByMonthDayYear24Hour(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}
