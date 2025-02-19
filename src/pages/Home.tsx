import { Link } from 'react-router-dom';
import {
  Car,
  BarChart3,
  Users,
  Smartphone,
  Clock,
  Share2,
  CheckCircle,
  ArrowRight,
  FileText,
  Shield,
  Mail,
  X,
  Laptop,
  Tablet,
  Headphones
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import ContactModal from '../components/ContactModal';
import DeveloperModal from '../components/DeveloperModal';
import imgParking from '/src/img/parking.jpeg';
import imgDesktop from '/src/img/desktop.png';
import imgMobile from '/src/img/mobile.png';
import TermsAndPrivacy from '../components/TermsAndPrivacy';

export default function Home() {
  const [showContact, setShowContact] = useState(false);
  const [showDeveloper, setShowDeveloper] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Referência para a seção de suporte
  const supportRef = useRef<HTMLDivElement>(null);

  // Efeito de parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'support' && supportRef.current) {
      supportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // ... outros casos de scroll
  };

  return (
    <div className="bg-white dark:bg-gray-900 pt-20">
      <Navbar onScrollToSection={scrollToSection} />
      {/* Hero Section com Parallax e Animações */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-orange-600 opacity-95"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage: `url(${imgParking})`  // Vamos usar uma imagem local
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48"
        >
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-orange-500 rounded-lg blur-md opacity-60" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Car className="h-16 w-16 text-orange-500" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-2">
                Wise<span className="text-orange-500">Park</span>
            </h1>
              <span className="text-lg text-orange-200 font-medium">Gestão Inteligente de Estacionamentos</span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col items-center"
            >
              <span className="px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-sm font-semibold mb-4">
                100% Gratuito
              </span>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Transforme a gestão do seu estacionamento com nossa plataforma intuitiva.
                Sem custos, sem complicações.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5"
              >
                Começar Agora - É Grátis!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 border border-white/20 text-base font-medium rounded-lg text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Acessar Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      {/* Benefits Section */}
      <div id="features" className="py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Benefícios</span>
            <h2 className="mt-2 text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Por que escolher o WisePark?
            </h2>
            <div className="mt-4 h-1 w-24 bg-orange-500 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle className="h-8 w-8 text-orange-500" />,
                title: 'Fácil de Usar',
                description: 'Desfrute de uma interface simples, intuitiva e fácil de navegar, projetada para atender usuários de todos os níveis.'
              },
              {
                icon: <Clock className="h-8 w-8 text-orange-500" />,
                title: 'Controle Total',
                description: 'Acompanhe em tempo real todas as entradas e saídas, mantendo o controle completo da operação.'
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-orange-500" />,
                title: 'Geração de Relatórios',
                description: 'Acesse, visualize e exporte relatórios detalhados para acompanhar com facilidade.'
              },
              {
                icon: <Share2 className="h-8 w-8 text-orange-500" />,
                title: 'Compartilhamento Seguro',
                description: 'Permita que outros usuários gerenciem o estacionamento, mantendo total controle sobre permissões e acessos. '
              },
              {
                icon: <Smartphone className="h-8 w-8 text-orange-500" />,
                title: 'Acesso de Qualquer Lugar',
                description: 'Acesse a plataforma de forma prática e segura pelo celular, tablet ou computador, esteja você onde estiver.'
              },
              {
                icon: <Shield className="h-8 w-8 text-orange-500" />,
                title: 'Segurança Garantida',
                description: 'Mantenha seus dados protegidos com as melhores práticas de segurança e criptografia avançada.'
              }
            ].map((benefit, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-200" />
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-8 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                  <div className="bg-orange-50 dark:bg-orange-500/10 p-3 rounded-lg w-fit mb-4">
                  {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Como funciona nosso sistema?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comece a usar em poucos passos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 text-primary-500" />,
                title: 'Crie sua conta',
                description: 'Cadastro simples e rápido'
              },
              {
                icon: <Car className="h-8 w-8 text-primary-500" />,
                title: 'Cadastre seu estacionamento',
                description: 'Configure os detalhes do seu espaço'
              },
              {
                icon: <Clock className="h-8 w-8 text-primary-500" />,
                title: 'Registre entradas e saídas',
                description: 'Acompanhe o fluxo de veículos'
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-primary-500" />,
                title: 'Gere relatórios',
                description: 'Visualize estatísticas detalhadas'
              },
              {
                icon: <Share2 className="h-8 w-8 text-primary-500" />,
                title: 'Compartilhe o acesso',
                description: 'Adicione outros usuários'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              O que nossos usuários dizem?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'João Silva',
                role: 'Gestor de Estacionamento',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                quote: 'O sistema revolucionou a gestão do meu estacionamento! Fácil, rápido e eficiente.'
              },
              {
                name: 'Maria Santos',
                role: 'Proprietária',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                quote: 'Excelente sistema! Os relatórios me ajudam a tomar decisões importantes para o negócio.'
              },
              {
                name: 'Carlos Oliveira',
                role: 'Administrador',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                quote: 'A facilidade de compartilhar acesso com minha equipe tornou tudo mais prático.'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Expandido */}
      <div id="faq" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Perguntas Frequentes
            </h2>
            <div className="mt-4 h-1 w-24 bg-orange-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                question: 'O sistema é realmente gratuito?',
                answer: 'Sim! O WisePark é 100% gratuito. Não há custos ocultos ou necessidade de cartão de crédito.'
              },
              {
                question: 'Existe limite de veículos ou usuários?',
                answer: 'Não há limites! Você pode registrar quantos veículos quiser e adicionar todos os usuários necessários.'
              },
              {
                question: 'Como funciona o suporte técnico?',
                answer: 'Oferecemos suporte por email e chat para todos os usuários, com tempo de resposta em até 24 horas.'
              },
              {
                question: 'Posso acessar de qualquer dispositivo?',
                answer: 'Sim! O sistema é responsivo e funciona perfeitamente em computadores, tablets e smartphones.'
              },
              {
                question: 'Meus dados estão seguros?',
                answer: 'Absolutamente! Utilizamos as mais modernas práticas de segurança e criptografia para proteger seus dados.'
              },
              {
                question: 'Como faço para começar?',
                answer: 'Basta clicar em "Começar Agora" e criar sua conta gratuitamente. Em poucos minutos você já pode começar a usar!'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <span className="text-orange-500 mr-2">
                    <FileText className="h-5 w-5" />
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsividade Section */}
      <div className="py-32 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="relative">
          {/* Elementos decorativos do background */}
          <div className="absolute -inset-x-40 -top-40 -bottom-40 bg-gradient-to-r from-orange-500/5 to-orange-500/10 transform -skew-y-12" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
                Acesse de Qualquer Lugar
              </span>
              <h2 className="mt-2 text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Sistema 100% Responsivo
              </h2>
              <div className="mt-4 h-1 w-24 bg-orange-500 mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Smartphone className="h-6 w-6 text-orange-500 mr-2" />
                      Acesso Mobile
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Use o sistema pelo celular com a mesma facilidade do desktop. Interface adaptada para telas menores.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Laptop className="h-6 w-6 text-orange-500 mr-2" />
                      Desktop Completo
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Aproveite todas as funcionalidades em telas maiores, com visualização detalhada de relatórios e dashboards.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Tablet className="h-6 w-6 text-orange-500 mr-2" />
                      Tablet Otimizado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Perfeito para tablets, combine a mobilidade com uma tela maior para melhor visualização.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative h-[500px]">
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="absolute right-0 top-0 w-3/4"
                >
                  <img
                    src={imgDesktop}
                    alt="Desktop interface"
                    className="rounded-lg shadow-2xl"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute left-0 bottom-0 w-1/2"
                >
                  <img
                    src={imgMobile}
                    alt="Mobile interface"
                    className="rounded-lg shadow-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Suporte */}
      <div ref={supportRef} className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
              Suporte
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Precisa de Ajuda?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Nossa equipe está pronta para ajudar você
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 mb-6">
                  <Headphones className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Suporte Técnico
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Encontrou alguma dificuldade? Tem alguma dúvida ou sugestão? 
                  Nossa equipe está disponível para ajudar você a ter a melhor experiência possível.
                </p>
                <button
                  onClick={() => setShowContact(true)}
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Entrar em Contato
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold text-white mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-center">
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                    Cadastre-se
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowDeveloper(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sobre o Desenvolvedor
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-center">
                <li>
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('openTerms'))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('openPrivacy'))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Política de Privacidade
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="text-lg font-semibold text-white mb-4">Contato</h4>
              <button
                onClick={() => setShowContact(true)}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Fale Conosco
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modais */}
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <DeveloperModal isOpen={showDeveloper} onClose={() => setShowDeveloper(false)} />
      <TermsAndPrivacy />
    </div>
  );
} 