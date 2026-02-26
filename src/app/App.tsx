import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { CanteenProvider } from './store/canteenContext';

export default function App() {
  return (
    <CanteenProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </CanteenProvider>
  );
}
