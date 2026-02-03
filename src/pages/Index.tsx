import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to welcome/voting page instead of dashboard directly
  return <Navigate to="/welcome" replace />;
};

export default Index;
