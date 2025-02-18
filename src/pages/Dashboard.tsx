import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, limit, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Car, LogIn, Building2, Settings, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  entryTime: Date;
  exitTime?: Date;
  parkingLotId: string;
}

interface Suggestion {
  plate: string;
  driver: string;
}

interface ParkingLot {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[];
}

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [currentParkingLot, setCurrentParkingLot] = useState<string>('');
  const [plate, setPlate] = useState('');
  const [driver, setDriver] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadParkingLots();
    }
  }, [user]);

  useEffect(() => {
    if (currentParkingLot) {
      loadVehicles();
    }
  }, [currentParkingLot]);

  const loadParkingLots = async () => {
    if (!user) {
      console.log('Usuário não autenticado');
      return;
    }

    try {
      console.log('Dados do usuário:', {
        uid: user.uid,
        email: user.email
      });
      
      const ownerQuery = query(
        collection(db, 'parkingLots'),
        where('ownerId', '==', user.uid)
      );
      
      const sharedQuery = query(
        collection(db, 'parkingLots'),
        where('sharedWith', 'array-contains', user.email)
      );

      console.log('Executando queries...');
      
      const [ownerSnapshot, sharedSnapshot] = await Promise.all([
        getDocs(ownerQuery),
        getDocs(sharedQuery)
      ]);

      console.log('Resultados:', {
        ownerDocs: ownerSnapshot.docs.length,
        sharedDocs: sharedSnapshot.docs.length
      });

      const lots = [
        ...ownerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...sharedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ] as ParkingLot[];

      console.log('Estacionamentos carregados:', lots);
      setParkingLots(lots);
      
      if (lots.length > 0 && !currentParkingLot) {
        setCurrentParkingLot(lots[0].id);
      }
    } catch (error) {
      console.error('Erro detalhado ao carregar estacionamentos:', error);
      toast.error('Erro ao carregar estacionamentos. Verifique as permissões.');
    }
  };

  const loadVehicles = async () => {
    try {
      const q = query(
        collection(db, 'vehicles'),
        where('exitTime', '==', null),
        where('parkingLotId', '==', currentParkingLot)
      );
      const querySnapshot = await getDocs(q);
      const vehiclesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        entryTime: doc.data().entryTime.toDate()
      })) as Vehicle[];
      setVehicles(vehiclesList);
    } catch (error) {
      toast.error('Erro ao carregar veículos');
    }
  };

  const searchPlates = async (searchTerm: string) => {
    setPlate(searchTerm.toUpperCase());
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'vehicles'),
        where('parkingLotId', '==', currentParkingLot)
      );
      
      const querySnapshot = await getDocs(q);
      const uniquePlates = new Map<string, Suggestion>();
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const plate = data.plate as string;
        
        if (plate.startsWith(searchTerm.toUpperCase()) && !uniquePlates.has(plate)) {
          uniquePlates.set(plate, {
            plate: plate,
            driver: data.driver
          });
        }
      });
      
      const suggestions = Array.from(uniquePlates.values())
        .sort((a, b) => a.plate.localeCompare(b.plate))
        .slice(0, 5);
      
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    setPlate(suggestion.plate);
    setDriver(suggestion.driver);
    setShowSuggestions(false);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const existingVehicleQuery = query(
        collection(db, 'vehicles'),
        where('plate', '==', plate.toUpperCase()),
        where('exitTime', '==', null),
        where('parkingLotId', '==', currentParkingLot)
      );
      
      const existingVehicleSnapshot = await getDocs(existingVehicleQuery);
      
      if (!existingVehicleSnapshot.empty) {
        toast.error('Este veículo já está neste estacionamento!');
        return;
      }

      await addDoc(collection(db, 'vehicles'), {
        plate: plate.toUpperCase(),
        driver,
        entryTime: new Date(),
        exitTime: null,
        parkingLotId: currentParkingLot
      });
      
      toast.success('Veículo registrado com sucesso!');
      setPlate('');
      setDriver('');
      loadVehicles();
    } catch (error) {
      console.error('Erro ao registrar veículo:', error);
      toast.error('Erro ao registrar veículo');
    }
  };

  const handleVehicleExit = async (vehicleId: string) => {
    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await updateDoc(vehicleRef, {
        exitTime: new Date()
      });
      
      toast.success('Saída registrada com sucesso!');
      loadVehicles();
    } catch (error) {
      toast.error('Erro ao registrar saída');
    }
  };

  const getCurrentParkingLotName = () => {
    return parkingLots.find(lot => lot.id === currentParkingLot)?.name || '';
  };

  if (!currentParkingLot ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Car className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Nenhum estacionamento encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Você precisa criar ou ter acesso a um estacionamento para começar.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar Estacionamento
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Building2 className="h-5 w-5 text-orange-500 mr-2" />
                Estacionamentos
              </h2>
              
              <div className="space-y-2">
                {parkingLots.map((lot) => (
                  <button
                    key={lot.id}
                    onClick={() => setCurrentParkingLot(lot.id)}
                    className={`w-full flex items-center px-4 py-2 rounded-lg text-left transition-colors ${
                      currentParkingLot === lot.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="truncate">{lot.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/settings"
                  className="w-full flex items-center px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Configurações</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {currentParkingLot ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Formulário de Entrada */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                      <Car className="h-6 w-6 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Registrar Entrada
                    </h2>
                  </div>

                  <form onSubmit={handleAddVehicle} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="relative">
                        <label htmlFor="plate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Placa
                        </label>
                        <input
                          type="text"
                          id="plate"
                          value={plate}
                          onChange={(e) => searchPlates(e.target.value)}
                          required
                          autoComplete="off"
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg">
                            <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                              {suggestions.map((suggestion, index) => (
                                <li
                                  key={index}
                                  onClick={() => selectSuggestion(suggestion)}
                                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  <div className="text-gray-900 dark:text-white">{suggestion.plate}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{suggestion.driver}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="driver" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Condutor
                        </label>
                        <input
                          type="text"
                          id="driver"
                          value={driver}
                          onChange={(e) => setDriver(e.target.value)}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Registrar Entrada
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista de Veículos */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Veículos no Pátio
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="p-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicle.plate}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {vehicle.driver}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(vehicle.entryTime, 'dd/MM/yyyy HH:mm')}
                          </span>
                          <button
                            onClick={() => handleVehicleExit(vehicle.id)}
                            className="flex items-center px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                          >
                            <LogIn className="h-4 w-4 mr-1" />
                            Registrar Saída
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecione um estacionamento
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Escolha um estacionamento para começar a registrar entradas e saídas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}