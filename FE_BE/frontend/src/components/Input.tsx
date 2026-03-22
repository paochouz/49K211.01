import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightElement?: ReactNode;
};

export default function Input({
  label,
  error,
  rightElement,
  ...props
}: Props) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className={`form-input-wrapper${rightElement ? " form-input-wrapper--has-right" : ""}`}>
        <input
          className={`form-input${rightElement ? " form-input--has-right" : ""}`}
          {...props}
        />
        {rightElement && <div className="form-input-right">{rightElement}</div>}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
