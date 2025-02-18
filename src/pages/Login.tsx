import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Car, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/dashboard');
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
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
              Faça login para acessar o sistema
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
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
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}