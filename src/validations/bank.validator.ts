import z from "zod"

export const StatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED", "BLOCKED"]);

// Schema for creating VendorBankAccount
export const CreateVendorBankAccountValidator = z.object(
  {
    accountHolder: z
      .string({required_error:"Account holder name is required"})
      .min(1, { message: "Account holder name cannot be empty" })
      .max(100, { message: "Account holder name must be at most 100 characters" }),

    bankName: z
      .string({required_error:"Bank name is required"})
      .min(1, { message: "Bank name cannot be empty" })
      .max(100, { message: "Bank name must be at most 100 characters" }),

    accountNumber: z
      .string({required_error:"Account number is required"})
      .min(10, { message: "Account number must be at least 10 digits" })
      .max(20, { message: "Account number must be at most 20 digits" })
      .regex(/^\d+$/, { message: "Account number must contain only digits" }),

    ifsc: z
      .string({required_error:"IFSC code is required"})
      .length(11, { message: "IFSC code must be exactly 11 characters" }),
      // .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
      //   message: "Invalid IFSC format (e.g., SBIN0001234)",
      // }),

    branch: z
      .string({required_error:"Branch name is invalid"})
      .max(100, { message: "Branch name must be at most 100 characters" })
      .optional(),
  },
  {
    message:"Request body must be an object"
  }
);

// Schema for updating VendorBankAccount
export const UpdateVendorBankAccountValidator = CreateVendorBankAccountValidator.partial().extend({
  status: StatusEnum.optional(),
  rejectReason: z
    .string({required_error:"Reject reason is required when status is REJECTED"})
    .max(500, { message: "Reject reason must be at most 500 characters" })
    .optional(),
}).superRefine((data, ctx) => {
  if (data.status === "REJECTED" && !data.rejectReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Reject reason is required when rejecting the bank account",
      path: ["rejectReason"],
    });
  }
  if (data.status !== "REJECTED" && data.rejectReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Reject reason can only be provided when status is REJECTED",
      path: ["rejectReason"],
    });
  }
});