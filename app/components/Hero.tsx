function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
          Papatango : Stratégie, Branding & Créativité
        </h1>
        <p className="text-lg sm:text-xl mb-10 opacity-90 animate-fade-in-up animation-delay-200">
          Agence créative à Genève et Paris. Nous transformons les ambitions en réussite grâce à la stratégie de marque, le design, l'UX/UI, les campagnes 360, et la production vidéo & photo.
        </p>
        <div className="flex justify-center space-x-4 animate-fade-in-up animation-delay-400">
          <a
            href="#contact"
            className="px-8 py-4 bg-white text-blue-600 rounded-full shadow-lg hover:bg-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg"
          >
            Démarrer un projet
          </a>
          <a
            href="#services"
            className="px-8 py-4 border border-white text-white rounded-full shadow-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300 font-semibold text-lg"
          >
            Nos services
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
