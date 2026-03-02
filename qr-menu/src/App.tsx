import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';
import Admin from './pages/Admin';
import PublicMenu from './pages/PublicMenu';
import StyleGuidePage from './pages/StyleGuidePage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicMenu />} />
        <Route path="/style" element={<StyleGuidePage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
