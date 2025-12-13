import { z } from 'zod'

export const productMonitorJobSchema = z.object({
	target_price: z.coerce.number<number>().min(1, 'Must have a minimum amount'),
	frequency: z.string().min(1, 'Enter a frequency'),
})

export type ProductMonitorJobFormData = z.infer<typeof productMonitorJobSchema>
