import { z } from "zod";

/** Calculator inputs as entered by the user (display units). */
export const tcoFormSchema = z.object({
  years: z.int().min(1).max(10),
  distancePerYear: z.number().min(1_000).max(100_000),
  fuelPrice: z.number().min(0).max(20),
  electricityPrice: z.number().min(0).max(2),
});

export type TcoForm = z.infer<typeof tcoFormSchema>;
