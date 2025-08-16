import Header from '@/app/components/Header';
import Hero from '@/app/components/Hero';
import Services from '@/app/components/Services';
import Footer from '@/app/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Header />
      <main>
        <Hero />
        <Services />
      </main>
      <Footer />
    </div>
  );
}
