import { Outlet } from 'react-router-dom';
import Container from '../components/Container';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg pb-10 text-text">
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}
