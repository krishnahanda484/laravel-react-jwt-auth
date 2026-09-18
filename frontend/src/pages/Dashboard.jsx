import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-card">
        <h2>Welcome, {user?.name}</h2>
        <dl>
          <dt>Name</dt>
          <dd>{user?.name}</dd>
          <dt>Email</dt>
          <dd>{user?.email}</dd>
          <dt>User ID</dt>
          <dd>{user?.id}</dd>
          <dt>Joined</dt>
          <dd>{user?.created_at ? new Date(user.created_at).toLocaleString() : '—'}</dd>
        </dl>
      </div>
    </div>
  );
}
