import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Closet } from './pages/Closet';
import { OutfitCreator } from './pages/OutfitCreator';
import { SavedOutfits } from './pages/SavedOutfits';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const location = useLocation();

  const handleAddClick = () => setIsUploadModalOpen(true);
  const handleCloseModal = () => setIsUploadModalOpen(false);

  // No mostrar Header en /login
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`app-container ${isLoginPage ? 'login-bg' : ''}`}>
      {!isLoginPage && <Header onAddClick={handleAddClick} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={
            <Closet 
              isUploadModalOpen={isUploadModalOpen} 
              onCloseModal={handleCloseModal} 
            />
          } />
          <Route path="/creator" element={<OutfitCreator />} />
          <Route path="/outfits" element={<SavedOutfits />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
