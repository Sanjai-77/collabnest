import { GoogleLogin } from '@react-oauth/google';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { idToken: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      message.success('Google login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      message.error(error.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="google-login-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log('Login Failed');
          message.error('Google Login Failed');
        }}
        useOneTap
        theme="outline"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
};

export default GoogleLoginButton;
