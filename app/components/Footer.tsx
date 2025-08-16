function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">Papatango</h3>
          <p className="text-gray-400">
            Agence créative basée à Genève et Paris.
            <br />
            Nous transformons les ambitions en succès.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Liens Rapides</h3>
          <ul className="space-y-2">
            <li><a href="#services" className="text-gray-400 hover:text-white transition-colors duration-200">Nos Services</a></li>
            <li><a href="#strategie" className="text-gray-400 hover:text-white transition-colors duration-200">Stratégie</a></li>
            <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Mentions Légales</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contactez-nous</h3>
          <p className="text-gray-400 mb-2">
            Genève, Suisse & Paris, France
          </p>
          <p className="text-gray-400 mb-2">
            Email: contact@papatango.com
          </p>
          <p className="text-gray-400">
            Téléphone: +41 123 456 789
          </p>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Papatango. Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;
