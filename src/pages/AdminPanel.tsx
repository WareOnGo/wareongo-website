import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { 
  Bot, 
  Presentation, 
  Sheet,
  Github,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();

  // Admin tool links
  const adminTools = [
    {
      name: 'Warehouse Search Agent',
      icon: Bot,
      url: 'https://warehouse-agentic-chatbot-frontend.vercel.app/',
      color: 'bg-blue-500',
      isLink: true
    },
    {
      name: 'PPT Generator',
      icon: Presentation,
      url: 'https://radiant-phoenix-e19499.netlify.app/',
      color: 'bg-green-500',
      isLink: true
    },
    {
      name: 'Warehouse Google Sheet',
      icon: Sheet,
      url: 'https://docs.google.com/spreadsheets/d/1dQovSt7gxmf-A6pbOirkwtmh6-lLz2ZDbXz-erG-DC8/edit?gid=0#gid=0',
      color: 'bg-emerald-500',
      isLink: true
    },
    {
      name: 'WareOnGo Github',
      icon: Github,
      url: 'https://github.com/WareOnGo',
      color: 'bg-gray-800',
      isLink: true
    },
    {
      name: 'Warehouse Ingestion Chatbot',
      icon: MessageSquare,
      url: '+1 (229) 458-4394',
      color: 'bg-purple-500',
      isLink: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-wareongo-ivory bg-opacity-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-wareongo-blue mb-2">Admin Panel</h1>
            <p className="text-lg text-wareongo-charcoal">
              Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>
            </p>
          </div>

          {/* Admin Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminTools.map((tool, index) => {
              const Icon = tool.icon;
              
              // If it's not a link (phone number), render as div
              if (!tool.isLink) {
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-wareongo-blue mb-4">
                        {tool.name}
                      </h3>
                    </div>
                    <div className="text-wareongo-charcoal text-sm font-medium">
                      {tool.url}
                    </div>
                  </div>
                );
              }
              
              // Otherwise render as link
              return (
                <a
                  key={index}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between hover:scale-105"
                >
                  <div>
                    <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-wareongo-blue mb-4 group-hover:text-wareongo-blue/80">
                      {tool.name}
                    </h3>
                  </div>
                  <div className="flex items-center text-wareongo-blue text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Open</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
