import { Navigate } from 'react-router';
import { useCanteen } from '../store/canteenContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCanteen();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
