import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: Props) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" {...props} />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}