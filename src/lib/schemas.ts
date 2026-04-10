import { z } from "zod";

export const StepSchema = z.object({
  stepNumber: z.number(),
  title: z.string(),
  description: z.string(),
  tip: z.string().optional().nullable(),
  icon: z.string().optional().nullable(), // emoji icon for visual guide
});

export const DocumentSchema = z.object({
  name: z.string(),
  required: z.boolean(),
  description: z.string(),
  alternatives: z.array(z.string()).optional().nullable(),
});

export const AuthoritySchema = z.object({
  name: z.string(),
  type: z.string(),
  contactInfo: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export const FormLinkSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string().optional().nullable(),
  isOfficial: z.boolean().default(true),
});

export const PortalLinkSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string().optional().nullable(),
});

export const SimplifiedOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  simplifiedText: z.string(),
  steps: z.array(StepSchema),
  requiredDocuments: z.array(DocumentSchema),
  authority: AuthoritySchema,
  estimatedTime: z.string().optional().nullable(),
  fees: z.string().optional().nullable(),
  warnings: z.array(z.string()).optional().nullable(),
  language: z.string().default("en"),

  // NEW FIELDS
  formLinks: z.array(FormLinkSchema).optional().nullable(),
  portalLinks: z.array(PortalLinkSchema).optional().nullable(),
  visualGuide: z.array(z.string()).optional().nullable(), // step-by-step emoji/text visual
});

export type Step = z.infer<typeof StepSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Authority = z.infer<typeof AuthoritySchema>;
export type FormLink = z.infer<typeof FormLinkSchema>;
export type PortalLink = z.infer<typeof PortalLinkSchema>;
export type SimplifiedOutput = z.infer<typeof SimplifiedOutputSchema>;