export interface OptionType {
	value: number | string
	label: string
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormField<T extends Record<string, any>> {
	name: keyof T
	label: string
	type?: string
	required?: boolean
	placeholder?: string
	readOnly?: boolean
	options?: OptionType[]
	defaultValue?: string | number | boolean | null
}
