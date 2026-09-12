import { trackEvent } from '@/lib/analytics';
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, config } from '../config/config';
import axios from 'axios';

const LoginButton = () => {
  const { login } = useAuth();

  const onSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        getApiUrl(config.api.googleLogin),
        { token: credentialResponse.credential }
      );
      login(response.data.token, response.data.user);
      trackEvent('login', { method: 'google' });
    } catch (error) {
      trackEvent('login_error', { method: 'google', error_code: 'server' });
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const onError = () => {
    trackEvent('login_error', { method: 'google', error_code: 'provider' });
    console.error('Google login failed');
    alert('Google login failed. Please try again.');
  };

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      useOneTap
    />
  );
};

export default LoginButton;
