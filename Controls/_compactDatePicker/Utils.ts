import {date as formatDate} from "Types/formatter";

export function getFormattedCaption(date: Date): string {
    const currentYear = new Date().getFullYear();
    if (date.getFullYear() !== currentYear) {
        return formatDate(date, formatDate.FULL_MONTH);
    } else {
        return formatDate(date, 'MMMM');
    }
}
