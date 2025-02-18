import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Car, Moon, Sun, ArrowLeft, FileText, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { termsAndPrivacy } from '../data/terms';
import TermsAndPrivacy from '../components/TermsAndPrivacy';

interface UserData {
  fullName: string;
  phone?: string;
  document?: string;
  email: string;
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      toast.error('Você precisa aceitar os termos de uso para continuar');
      return;
    }

    try {
      const userCredential = await signUp(email, password);
      
      const userData: UserData = {
        fullName,
        email,
        ...(phone && { phone }),
        ...(document && { document })
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      navigate('/');
      toast.success('Conta criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
    }
  };

  const formatPhone = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.slice(0, 11);
  };

  const formatDocument = (value: string) => {
    // Remove non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format as CPF or CNPJ
    if (numbers.length <= 11) {
      // CPF: XXX.XXX.XXX-XX
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: XX.XXX.XXX/XXXX-XX
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <Link
        to="/"
        className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <span className="text-gray-700 dark:text-gray-300">Voltar</span>
      </Link>
      
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-orange-500 rounded-lg blur-sm opacity-60" />
                <div className="relative bg-white dark:bg-gray-900 rounded-lg p-3">
                  <Car className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Wise<span className="text-orange-500">Park</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Crie sua conta para começar
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome Completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  CPF/CNPJ
                </label>
                <input
                  id="document"
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(formatDocument(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center mt-4">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  Li e concordo com os{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    Termos de Uso
                  </button>
                  {' '}e a{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    Política de Privacidade
                  </button>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            >
              Criar Conta
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Já tem uma conta? Faça login
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Modais de Termos e Privacidade */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 py-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-6 w-6 text-orange-500 mr-2" />
                {termsAndPrivacy.terms.title}
              </h2>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="prose dark:prose-invert prose-orange max-w-none">
              {termsAndPrivacy.terms.sections.map((section, index) => (
                <div key={index}>
                  <h3>{section.title}</h3>
                  {section.content && section.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {section.items && (
                    <ul>
                      {section.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Privacidade - Similar ao de Termos */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 py-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-6 w-6 text-orange-500 mr-2" />
                {termsAndPrivacy.privacy.title}
              </h2>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="prose dark:prose-invert prose-orange max-w-none">
              {termsAndPrivacy.privacy.sections.map((section, index) => (
                <div key={index}>
                  <h3>{section.title}</h3>
                  {section.content && section.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {section.items && (
                    <ul>
                      {section.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}