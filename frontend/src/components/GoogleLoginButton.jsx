import { GoogleLogin } from '@react-oauth/google';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success('Google login successful!');
        navigate('/dashboard');
      } else {
        message.error(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      message.error('Server error, please try again later');
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
