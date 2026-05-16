import React from 'react';
import PageHead from '@/components/PageHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const UserDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHead title="Dashboard | WareOnGo" description="Your WareOnGo dashboard." path="/user-dashboard" noindex />
      <Navbar />
      
      <main className="flex-grow bg-wareongo-ivory bg-opacity-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-wareongo-charcoal">
            Coming Soon
          </h1>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
