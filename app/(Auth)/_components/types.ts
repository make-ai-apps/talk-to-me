import { z } from "zod"

export const registerSchema = z.object({
    name: z.string()
        .min(2, {
            message: "Name must be at least 2 characters long.",
        })
        .max(50, {
            message: "Name cannot exceed 50 characters.",
        })
        .regex(/^[a-zA-Z\s]*$/, {
            message: "Name can only contain letters and spaces.",
        })
        .nonempty({
            message: "Name is required.",
        }), // Ensures the name is not an empty string
    email: z.string()
        .email({
            message: "Please enter a valid email address.",
        })
        .nonempty({
            message: "Email is required.",
        }), // Ensures the email is not an empty string
    password: z.string()
        .min(8, {
            message: "Password must be at least 8 characters long.",
        })
        .max(128, {
            message: "Password cannot exceed 128 characters.",
        })
        // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
        //     message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        // })
        .nonempty({
            message: "Password is required.",
        }), // Ensures the password is not an empty string
});

export type IRegister = z.infer<typeof registerSchema>
export const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .nonempty("Email is required"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .nonempty("Password is required"),
});

// Define the login interface based on the schema
export type ILogin = z.infer<typeof loginSchema>;