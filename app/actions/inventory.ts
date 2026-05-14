// 'use server'
// import { createClient } from '@/supabase/server'
// import { z } from 'zod'
// import { revalidatePath } from 'next/cache'

// const MovementSchema = z.object({
//   productId: z.string().uuid(),
//   type: z.enum(['IN', 'OUT', 'ADJUST']),
//   quantity: z.number().int().positive(),
//   notes: z.string().optional(),
// })

// export async function createMovement(raw: unknown) {
//   const supabase = createClient()
//   const parsed = MovementSchema.safeParse(raw)
//   if (!parsed.success) throw new Error('Datos inválidos')

//   const {  { user } } = await supabase.auth.getUser()
//   if (!user) throw new Error('No autorizado')

//   const { type, productId, quantity, notes } = parsed.data

//   // Transacción atómica
//   const { error } = await supabase.rpc('create_inventory_movement', {
//     p_product_id: productId,
//     p_user_id: user.id,
//     p_type: type,
//     p_quantity: quantity,
//     p_notes: notes || null
//   })

//   if (error) throw error

//   revalidatePath('/dashboard/products')
//   revalidatePath('/dashboard/movements')
//   return { success: true }
// }
