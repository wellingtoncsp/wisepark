import { X, Github, Linkedin, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imgAvatar from '../img/avatar.png';
interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperModal({ isOpen, onClose }: DeveloperModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl"
            >
              <div className="relative p-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center">
                  <img
                    src={imgAvatar}
                    alt="Developer"
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-orange-500 object-cover"
                  />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Wellington Carlos
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Desenvolvedor Full Stack apaixonado por criar soluções inovadoras e intuitivas.
                  </p>

                  <div className="flex justify-center space-x-4">
                    <a
                      href="https://github.com/wellingtoncsp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                    >
                      <Github className="h-6 w-6" />
                    </a>
                    <a
                      href="https://linkedin.com/in/wellington-porto1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                    <a
                      href="mailto:wellingtoncsp25@gmail.com"
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                    >
                      <Mail className="h-6 w-6" />
                    </a>
                  </div>

                  <div className="mt-8 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Sobre
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                    O WisePark foi desenvolvido com dedicação para oferecer uma solução moderna e eficiente para o gerenciamento de estacionamentos.
                    Obrigado por escolher o WisePark!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 