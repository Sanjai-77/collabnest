import { GoogleLogin } from '@react-oauth/google';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../config/api';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const [authenticating, setAuthenticating] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setAuthenticating(true);
    console.log('Google login success response received from Google');
    
    // Check if client ID is missing in frontend env
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not defined in the frontend environment!');
    }

    try {
      const res = await api.post('/auth/google', { idToken: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      message.success('Google login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error details from backend:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Google login failed');
    } finally {
      setAuthenticating(false);
    }
  };

  // Show a loading spinner while we verify the Google token server-side
  if (authenticating) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', marginBottom: 24 }}>
        <Spin tip="Signing you in..." />
      </div>
    );
  }

  return (
    <div className="google-login-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          message.error('Google Login Failed');
        }}
        theme="outline"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
};

export default GoogleLoginButton;
