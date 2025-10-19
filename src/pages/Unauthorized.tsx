import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-wareongo-ivory bg-opacity-50 flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <ShieldX className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-wareongo-blue mb-4">
              Access Denied
            </h1>
            <p className="text-xl text-wareongo-charcoal mb-6">
              You don't have permission to access this page.
            </p>
            <p className="text-gray-600 mb-8">
              This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
            </p>
            <Link to="/">
              <Button className="btn-primary">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Unauthorized;
