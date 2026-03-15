import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";

import { AlertMessage } from "@/components/alert-message";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { LoginRequestSchema } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/hooks/use-auth";

export function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const form = useForm({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { password: "" },
  });

  const handleSubmit = async (values: { password: string }) => {
    clearError();
    await login(values.password);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-md)]">
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold tracking-tight">Zaloguj się</h2>
          <p className="text-sm text-muted-foreground">Wpisz hasło administratora, aby kontynuować.</p>
        </div>

        <div className="mt-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Hasło</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="current-password"
                    placeholder="Wpisz hasło"
                    disabled={loading}
                    leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
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
          Zaloguj się
        </Button>
      </form>
    </Form>
  );
}
