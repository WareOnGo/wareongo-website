
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12">
        <h1 className="text-4xl font-bold text-wareongo-blue mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <Button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
