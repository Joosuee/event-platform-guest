import { createBrowserRouter } from 'react-router-dom';
import InvitePage from './pages/InvitePage';
import ScreenPage from './pages/ScreenPage';
import NoTokenPage from './pages/NoTokenPage';
import InstantPage from './pages/InstantPage';
import MemoryPage from './pages/MemoryPage';

export const router = createBrowserRouter([
  { path: '/', element: <NoTokenPage /> },
  { path: '/invite/:token', element: <InvitePage /> },
  { path: '/instantaneas/:token', element: <InstantPage /> },
  { path: '/recuerdos/:token', element: <MemoryPage /> },
  { path: '/pantalla/:slug', element: <ScreenPage /> },
  { path: '*', element: <NoTokenPage /> },
]);