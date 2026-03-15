import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AlertMessage } from "@/components/alert-message";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth/hooks/use-auth";

const SetupAdminPasswordSchema = z
  .object({
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    passwordConfirm: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  })
  .superRefine((values, context) => {
    if (values.password !== values.passwordConfirm) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hasła muszą być identyczne",
        path: ["passwordConfirm"],
      });
    }
  });

type SetupAdminPasswordValues = z.infer<typeof SetupAdminPasswordSchema>;

export function SetupPasswordForm() {
  const submitSetupPassword = useAuthStore((state) => state.setupPassword);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const form = useForm<SetupAdminPasswordValues>({
    resolver: zodResolver(SetupAdminPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSubmit = async (values: SetupAdminPasswordValues) => {
    clearError();
    await submitSetupPassword(values.password);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-md)]">
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold tracking-tight">Skonfiguruj hasło administratora</h2>
          <p className="text-sm text-muted-foreground">
            To pierwsze uruchomienie panelu. Ustaw hasło, aby zablokować dostęp osobom z zewnątrz.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Hasło</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    placeholder="Min. 8 znaków"
                    disabled={loading}
                    leftIcon={<KeyRound className="h-4 w-4" aria-hidden="true" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Powtórz hasło</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    placeholder="Powtórz hasło"
                    disabled={loading}
                    leftIcon={<KeyRound className="h-4 w-4" aria-hidden="true" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error ? <AlertMessage variant="error" className="mt-4">{error}</AlertMessage> : null}

        <Button type="submit" className="press-scale mt-5 w-full" disabled={loading}>
          {loading ? <Spinner size="sm" className="mr-2" /> : null}
          Zapisz hasło
        </Button>
      </form>
    </Form>
  );
}
