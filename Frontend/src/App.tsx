import React from 'react';
import Home from './pages/Home';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Home />
    </div>
  );
};

export default App;
