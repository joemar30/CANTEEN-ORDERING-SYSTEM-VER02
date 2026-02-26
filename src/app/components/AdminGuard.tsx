import { Navigate } from 'react-router';
import { useCanteen } from '../store/canteenContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCanteen();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'customer') return <Navigate to="/menu" replace />;
  return <>{children}</>;
}
