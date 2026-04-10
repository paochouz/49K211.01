import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className }: Props) {
  return <div className={`app-card${className ? ` ${className}` : ""}`}>{children}</div>;
<<<<<<< HEAD
}
=======
}
>>>>>>> ffd36726ff37faff37c8a5913a30a64839736ecb
