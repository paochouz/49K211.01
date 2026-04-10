import { Navigate } from 'react-router-dom';
import { isLoggedIn, isOwner } from '../hooks/useAuth';

interface Props {
  children: React.ReactNode;
  ownerOnly?: boolean;
}

export default function ProtectedRoute({ children, ownerOnly = false }: Props) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  if (ownerOnly && !isOwner()) return <Navigate to="/home" replace />;
  return <>{children}</>;
}
