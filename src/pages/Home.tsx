
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirecionar para a página do chatbot
    navigate('/chatbot');
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Redirecionando...</p>
    </div>
  );
};

export default Home;
