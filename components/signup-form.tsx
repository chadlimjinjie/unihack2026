"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useForm } from "@tanstack/react-form"
import Link from "next/link"
import { redirect } from "next/navigation"
import { z } from "zod"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {

  const formSchema = z.object({
    name: z
      .string()
      .min(1, 'Full name is required'),
    email: z
      .email('Must be a valid email')
      .min(1, 'Email is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      // .min(8, 'Password must be at least 8 characters')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {


      await authClient.signUp.email({
        email: value.email, // user email address
        password: value.password, // user password -> min 8 characters by default
        name: value.name, // user display name
        // image: value.image, // User image URL (optional)
        callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
      }, {
        onRequest: (ctx) => {
          // show loading
        },
        onSuccess: (ctx) => {
          // redirect to the dashboard or sign in page
          redirect("/dashboard");
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
        },
      });


      // toast("You submitted the following values:", {
      //   description: (
      //     <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
      //       <code>{JSON.stringify(value, null, 2)}</code>
      //     </pre>
      //   ),
      //   position: "bottom-right",
      //   classNames: {
      //     content: "flex flex-col gap-2",
      //   },
      //   style: {
      //     "--border-radius": "calc(var(--radius)  + 4px)",
      //   } as React.CSSProperties,
      // })
    },
  })

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="signup-form" onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Login button not working on mobile"
                      autoComplete="off"
                    />
                  </Field>
                  //   {isInvalid && (
                  //     <FieldError errors={field.state.meta.errors} />
                  //   )}
                )
              }}
            />
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="m@example.com"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      We&apos;ll use this to contact you. We will not share your email
                      with anyone else.
                    </FieldDescription>
                  </Field>
                  //   {isInvalid && (
                  //     <FieldError errors={field.state.meta.errors} />
                  //   )}
                )
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••"
                      autoComplete="off"
                      required
                      type="password"
                    />
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  //   {isInvalid && (
                  //     <FieldError errors={field.state.meta.errors} />
                  //   )}
                )
              }}
            />
            {/* <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field> */}
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" form="signup-form">
                  Create Account
                </Button>
                {/* <Button variant="outline" type="button">
                  Sign up with Google
                </Button> */}
                <FieldDescription className="px-6 text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
