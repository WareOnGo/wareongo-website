import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, config } from '../config/config';
import axios from 'axios';

const LoginButton = () => {
  const { login } = useAuth();

  const onSuccess = async (credentialResponse) => {
    try {
      console.log('Google login successful, sending to backend...');
      
      // Send the credential to our backend
      const response = await axios.post(
        getApiUrl(config.api.googleLogin),
        {
          token: credentialResponse.credential
        }
      );

      console.log('Backend response:', response.data);

      // Call login with the token and user data from backend
      login(response.data.token, response.data.user);
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const onError = () => {
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
