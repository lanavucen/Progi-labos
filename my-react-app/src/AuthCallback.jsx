import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        
        localStorage.setItem('user', JSON.stringify(decodedUser));
        localStorage.setItem('token', token);
        navigate('/Profil');
      } catch (error) {
        console.error("Invalid token:", error);
        navigate('/Prijava');
      }
    } else {
      navigate('/Prijava');
    }
  }, [navigate, searchParams]);

  return <div>Pripremanje vašeg računa...</div>;
}

export default AuthCallback;