import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-700 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#343A40] text-white border border-neutral-600 shadow hover:bg-[#2c3136] focus-visible:ring-neutral-500",
        destructive:
          "bg-red-600 text-white border border-red-500 shadow-sm hover:bg-red-500 focus-visible:ring-red-400",
        outline:
          "border border-neutral-500 bg-[#2c3136] text-white shadow-sm hover:bg-[#3a3f44] focus-visible:ring-neutral-500",
        secondary:
          "bg-[#2c3136] text-neutral-300 border border-neutral-500 shadow-sm hover:bg-[#3a3f44] focus-visible:ring-neutral-500",
        ghost: "border border-neutral-500 hover:bg-[#3a3f44] text-neutral-300 focus-visible:ring-neutral-500",
        link: "text-neutral-300 underline-offset-4 hover:underline focus-visible:ring-neutral-500 border-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
