export const DATE_FORMAT_DISPLAY = 'MM/DD/YYYY HH:mm a'
export const DEFAULT_PAGE_SIZE = 10
export const VALIDATION_RULES = {
	text: ['min_length', 'max_length', 'pattern'],
	number: ['min', 'max'],
	date: ['min_date', 'max_date'],
	datetime: ['min_datetime', 'max_datetime'],
}
