import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RealtimeToast from '../components/RealtimeToast';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <RealtimeToast />
    </div>
  );
};

export default PublicLayout;
