import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Paper Bets</span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hover:text-indigo-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/bets"
                  className="hover:text-indigo-200 transition-colors"
                >
                  My Bets
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-semibold">{user?.username}</span>
                    <div className="text-indigo-200">
                      Balance: ${user?.balance.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-indigo-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
