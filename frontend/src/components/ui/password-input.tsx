import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  leftIcon?: React.ReactNode
  containerClassName?: string
}

function PasswordInput({
  leftIcon,
  containerClassName,
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className={cn("relative", containerClassName)}>
      {leftIcon ? (
        <span
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground/60"
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      ) : null}
      <Input
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn(leftIcon ? "pl-9" : null, "pr-9", className)}
      />
      <button
        type="button"
        className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/70 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setVisible((prev) => !prev)}
        disabled={disabled}
        aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  )
}

export { PasswordInput }
