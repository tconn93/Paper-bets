import { Link } from 'react-router-dom';
import { Register } from '../components/Register';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600">Paper Bets</h1>
          <p className="mt-2 text-gray-600">
            Create your account and start betting with fake money!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <Register />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
