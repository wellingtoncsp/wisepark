import { useState, useEffect } from 'react';
import { X, FileText, Shield } from 'lucide-react';
import { termsAndPrivacy } from '../data/terms';

export default function TermsAndPrivacy() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const handleOpenTerms = () => setShowTerms(true);
    const handleOpenPrivacy = () => setShowPrivacy(true);

    document.addEventListener('openTerms', handleOpenTerms);
    document.addEventListener('openPrivacy', handleOpenPrivacy);

    return () => {
      document.removeEventListener('openTerms', handleOpenTerms);
      document.removeEventListener('openPrivacy', handleOpenPrivacy);
    };
  }, []);

  const renderSections = (sections: any[]) => {
    return sections.map((section, index) => (
      <div key={index}>
        <h3>{section.title}</h3>
        {section.content && section.content.map((p: string, i: number) => (
          <p key={i}>{p}</p>
        ))}
        {section.items && (
          <ul>
            {section.items.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    ));
  };

  return (
    <>
      {/* Modal de Termos */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 py-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-6 w-6 text-orange-500 mr-2" />
                {termsAndPrivacy.terms.title}
              </h2>
              <button 
                onClick={() => setShowTerms(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="prose dark:prose-invert prose-orange max-w-none">
              {renderSections(termsAndPrivacy.terms.sections)}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Privacidade */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 py-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Shield className="h-6 w-6 text-orange-500 mr-2" />
                {termsAndPrivacy.privacy.title}
              </h2>
              <button 
                onClick={() => setShowPrivacy(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="prose dark:prose-invert prose-orange max-w-none">
              {renderSections(termsAndPrivacy.privacy.sections)}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 