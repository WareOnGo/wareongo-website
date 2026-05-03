import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CaseStudy2 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-wareongo-ivory">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="text-sm font-semibold text-wareongo-blue uppercase tracking-wider mb-4 block">Case Study 02</span>
          <h1 className="text-4xl md:text-5xl font-bold text-wareongo-blue mb-6">
            Headline placeholder for the second case study
          </h1>
          <p className="text-xl text-wareongo-slate mb-10 leading-relaxed">
            Short summary of the client, the challenge, and the outcome WareOnGo delivered.
          </p>

          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80" 
            alt="Case Study 2" 
            className="w-full rounded-2xl shadow-md mb-12 aspect-[16/9] object-cover"
          />

          <div className="prose prose-lg prose-blue max-w-none text-wareongo-slate">
            <h2 className="text-2xl font-bold text-wareongo-blue mb-4">The Challenge</h2>
            <p className="mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="mb-8">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>

            <h2 className="text-2xl font-bold text-wareongo-blue mb-4">Our Approach</h2>
            <p className="mb-6">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. 
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</li>
              <li>Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</li>
              <li>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.</li>
            </ul>

            <h2 className="text-2xl font-bold text-wareongo-blue mb-4">The Outcome</h2>
            <p className="mb-6">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaseStudy2;
