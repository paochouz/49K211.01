import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export default function Button({
  children,
  variant = "primary",
  ...props
}: Props) {
  return (
    <button {...props} className={`app-button app-button--${variant}`}>
      {children}
    </button>
  );
}