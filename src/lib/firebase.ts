import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1YLztNXt0tnNb0GeuiHBei9P5IwqEFdw",
  authDomain: "garagem-9c5b0.firebaseapp.com",
  projectId: "garagem-9c5b0",
  storageBucket: "garagem-9c5b0.appspot.com",
  messagingSenderId: "473016094940",
  appId: "1:473016094940:web:64a4decf0673b62744e419",
  measurementId: "G-M3WJMLN4RC"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
if (process.env.NODE_ENV !== 'production') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      console.error('Erro ao habilitar persistência:', err);
      if (err.code === 'failed-precondition') {
        console.warn('Múltiplas abas abertas. Persistência disponível em apenas uma aba.');
      } else if (err.code === 'unimplemented') {
        console.warn('O navegador não suporta persistência.');
      }
    });
}

// Enable Firestore logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase inicializado no modo desenvolvimento');
}

