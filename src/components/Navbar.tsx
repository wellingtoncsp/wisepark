import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Menu, X, Settings, ChevronDown, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface UserData {
  fullName: string;
  email: string;
  phone?: string;
  document?: string;
}

interface NavbarProps {
  onScrollToSection: (sectionId: string) => void;
}

export default function Navbar({ onScrollToSection }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' 
          : 'h-20 bg-gray-900 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-orange-500 rounded-lg blur-sm opacity-60" />
              <div className={`relative rounded-lg p-2 ${
                isScrolled ? 'bg-white dark:bg-gray-900' : 'bg-white/10'
              }`}>
                <Car className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-extrabold ${
                isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
              }`}>
                Wise<span className="text-orange-500">Park</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('features')}
              className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-200'
              }`}
            >
              Benefícios
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-200'
              }`}
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-200'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => onScrollToSection('support')}
              className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-200'
              }`}
            >
              Suporte
            </button>

            <Link
              to="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10 ${
                isScrolled 
                  ? 'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600' 
                  : 'text-gray-200 border border-white/20'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            >
              Criar Conta
            </Link>

            
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${
              isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-200'
            }`}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 dark:text-gray-300"
              >
                Benefícios
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 dark:text-gray-300"
              >
                Como Funciona
              </button>
              <button
                onClick={() => onScrollToSection('support')}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 dark:text-gray-300"
              >
                Suporte
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 dark:text-gray-300"
              >
                FAQ
              </button>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-500 dark:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center mt-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  Criar Conta
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 