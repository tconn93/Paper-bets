import { Link } from 'react-router-dom';
import { Login } from '../components/Login';

export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600">Paper Bets</h1>
          <p className="mt-2 text-gray-600">
            Sports betting with fake money - Practice without risk!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <Login />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
