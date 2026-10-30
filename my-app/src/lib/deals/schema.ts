import { z } from "zod";

export const dealSchema = z.object({
  productName: z.string().trim().min(1),
  advertisedPrice: z.number().finite().positive(),
  priceUnit: z.string().trim().min(1),
  requiresLoyaltyCard: z.boolean(),
  requiresDigitalCoupon: z.boolean(),
  minimumQuantity: z.number().int().min(1),
});

export const circularSchema = z.object({
  source: z.object({
    store: z.string().trim().min(1),
    circularPage: z.number().int().positive(),
    validFrom: z.iso.date(),
    validTo: z.iso.date(),
  }),
  deals: z.array(dealSchema),
});

export type Deal = z.infer<typeof dealSchema>;
export type CircularData = z.infer<typeof circularSchema>;
