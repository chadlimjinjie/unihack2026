"use client"

import { cn } from "@/lib/utils"
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
import { redirect } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      image: "",
    },
    // validators: {
    //   onSubmit: formSchema,
    // },
    onSubmit: async ({ value }) => {

      await authClient.signIn.email({
        email: value.email, // user email address
        password: value.password, // user password -> min 8 characters by default
      }, {
        onRequest: (ctx) => {
          // show loading
        },
        onSuccess: (ctx) => {
          // redirect to the dashboard or sign in page
          redirect("/dashboard")
        }
      })
    }
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
              <FieldGroup>
                <Field>
                  <Button type="submit">Login</Button>
                  <Button variant="outline" type="button">
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="#">Sign up</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
