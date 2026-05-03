import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginButton from '@/components/LoginButton';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-wareongo-ivory px-4">
      <div className="bg-white shadow-sm rounded-xl p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-wareongo-blue mb-2">Login</h1>
        <p className="text-sm text-wareongo-slate mb-6">
          Sign in to your WareOnGo account.
        </p>
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

export default Login;
