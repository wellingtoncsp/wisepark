import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Building2, Car, FileSpreadsheet, Settings as SettingsIcon, Share, ArrowLeftCircleIcon ,Trash2,StepBack,  X, ArrowLeft, FileText, BarChart as ChartIcon, Share2 } from 'lucide-react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { format, parseISO, parse } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ResponsiveContainer } from 'recharts';

interface ParkingLot {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[];
}

interface FormEvent extends React.FormEvent<HTMLFormElement> {
  target: HTMLFormElement & {
    parkingName: HTMLInputElement;
  };
}

interface UserData {
  fullName: string;
  phone?: string;
  document?: string;
  email: string;
}

interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  entryTime: Date;
  exitTime?: Date;
}

interface VehicleReport extends Vehicle {
  parkingLotName?: string;
  duration?: string;
}

interface ChartData {
  hora: string;
  entradas: number;
  saidas: number;
}

interface OcupacaoData {
  name: string;
  value: number;
}

interface TempoMedioPermanencia {
  name: string;
  tempo: number;
}

interface OcupacaoDia {
  dia: string;
  ocupacao: number;
}

const VehiclesListComponent = ({ parkingLotId }: { parkingLotId: string }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const q = query(
          collection(db, 'vehicles'),
          where('parkingLotId', '==', parkingLotId),
          where('exitTime', '==', null)
        );
        
        const querySnapshot = await getDocs(q);
        const vehiclesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          entryTime: doc.data().entryTime.toDate()
        })) as Vehicle[];

        setVehicles(vehiclesList);
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        toast.error('Erro ao carregar veículos');
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [parkingLotId]);

  if (loading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Nenhum veículo no pátio no momento.
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Placa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Condutor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Entrada
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Tempo
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {vehicles.map((vehicle) => {
            const duration = new Date().getTime() - vehicle.entryTime.getTime();
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

            return (
              <tr key={vehicle.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.plate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {vehicle.driver}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {format(vehicle.entryTime, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {hours}h {minutes}min
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Registrar o locale ptBR
registerLocale('pt-BR', ptBR);

export default function Settings() {
  const views: Record<string, string> = {
    profile: 'Meu Perfil',
    manage: 'Gerenciar Estacionamentos',
    report: 'Relatório',
    view: 'Visualizar Pátio',
    charts: 'Gráficos'
  };

  const [currentView, setCurrentView] = useState<string>('manage');
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [sharingParkingId, setSharingParkingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [movimentacaoPorHora, setMovimentacaoPorHora] = useState<ChartData[]>([]);
  const [ocupacaoPorEstacionamento, setOcupacaoPorEstacionamento] = useState<OcupacaoData[]>([]);
  const [reportData, setReportData] = useState<VehicleReport[]>([]);
  const [period, setPeriod] = useState('today');
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [compareWithYesterday, setCompareWithYesterday] = useState(0);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const [tempoMedioPermanencia, setTempoMedioPermanencia] = useState<TempoMedioPermanencia[]>([]);
  const [ocupacaoPorDia, setOcupacaoPorDia] = useState<OcupacaoDia[]>([
    { dia: 'Dom', ocupacao: 0 },
    { dia: 'Seg', ocupacao: 0 },
    { dia: 'Ter', ocupacao: 0 },
    { dia: 'Qua', ocupacao: 0 },
    { dia: 'Qui', ocupacao: 0 },
    { dia: 'Sex', ocupacao: 0 },
    { dia: 'Sáb', ocupacao: 0 }
  ]);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  // Adicionar estado para controlar o modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // Adicionar estados para os modais
  const [showRemoveAccessModal, setShowRemoveAccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [parkingToRemove, setParkingToRemove] = useState<string | null>(null);
  const [parkingToDelete, setParkingToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadParkingLots();
      loadUserData();
    }
  }, [user]);

  const loadParkingLots = async () => {
    if (!user) return;

    try {
      const ownerQuery = query(
        collection(db, 'parkingLots'),
        where('ownerId', '==', user.uid)
      );
      
      const sharedQuery = query(
        collection(db, 'parkingLots'),
        where('sharedWith', 'array-contains', user.email)
      );

      const [ownerSnapshot, sharedSnapshot] = await Promise.all([
        getDocs(ownerQuery),
        getDocs(sharedQuery)
      ]);

      const lots = [
        ...ownerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingLot)),
        ...sharedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParkingLot))
      ];

      setParkingLots(lots);
    } catch (error) {
      toast.error('Erro ao carregar estacionamentos');
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do usuário');
    }
  };

  const handleAddParkingLot = async (e: FormEvent) => {
    e.preventDefault();
    const name = e.target.parkingName.value;

    if (!user) return;

    try {
      await addDoc(collection(db, 'parkingLots'), {
        name,
        ownerId: user.uid,
        sharedWith: []
      });
      
      toast.success('Estacionamento adicionado com sucesso!');
      loadParkingLots();
      e.target.reset();
    } catch (error) {
      toast.error('Erro ao adicionar estacionamento');
    }
  };

  const handleShareParkingLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParkingId || !shareEmail) return;

    try {
      // Verificar se está tentando compartilhar com o proprietário
      const parkingLot = parkingLots.find(lot => lot.id === selectedParkingId);
      if (parkingLot && user?.email === shareEmail) {
        toast.error('Não é possível compartilhar com o proprietário do estacionamento');
        return;
      }

      // Primeiro, verificar se existe usuário com este email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', shareEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('Usuário não encontrado. O email informado precisa ter uma conta no sistema.');
        return;
      }

      // Verificar se já não está compartilhado
      const parkingRef = doc(db, 'parkingLots', selectedParkingId);
      const parkingDoc = await getDoc(parkingRef);
      
      if (parkingDoc.exists()) {
        const parkingData = parkingDoc.data();
        if (parkingData.sharedWith?.includes(shareEmail)) {
          toast.error('Este estacionamento já está compartilhado com este usuário');
          return;
        }

        // Atualizar o documento com o novo email
        await updateDoc(parkingRef, {
          sharedWith: [...(parkingData.sharedWith || []), shareEmail]
        });

        toast.success('Estacionamento compartilhado com sucesso!');
        setIsShareModalOpen(false);
        setSelectedParkingId(null);
        setShareEmail('');
        
        // Recarregar a lista de estacionamentos
        loadParkingLots();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Erro ao compartilhar estacionamento');
    }
  };

  const handleRemoveAccess = async (parkingId: string) => {
    try {
      const parkingRef = doc(db, 'parkingLots', parkingId);
      const parkingDoc = await getDoc(parkingRef);
      
      if (parkingDoc.exists() && user?.email) {
        const parkingData = parkingDoc.data();
        const updatedSharedWith = parkingData.sharedWith.filter(
          (email: string) => email !== user.email
        );
        
        await updateDoc(parkingRef, {
          sharedWith: updatedSharedWith
        });
        
        toast.success('Acesso removido com sucesso');
        loadParkingLots();
      }
    } catch (error) {
      console.error('Erro ao remover acesso:', error);
      toast.error('Erro ao remover acesso');
    }
  };

  const handleDeleteParkingLot = async (parkingId: string) => {
    try {
      await deleteDoc(doc(db, 'parkingLots', parkingId));
      toast.success('Estacionamento excluído com sucesso!');
      loadParkingLots();
    } catch (error) {
      toast.error('Erro ao excluir estacionamento');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !userData) return;

    try {
      const updateData = {
        fullName: userData.fullName,
        phone: userData.phone || '',
        document: userData.document || '',
        email: user.email
      };

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, updateData);
      } else {
        await updateDoc(userRef, updateData);
      }
      
      await loadUserData();
      setIsEditingProfile(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.email) return;

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar senha. Verifique sua senha atual.');
    }
  };

  const openShareModal = (parkingId: string) => {
    setSelectedParkingId(parkingId);
    setIsShareModalOpen(true);
  };

  const calculateDuration = (entry: Date, exit: Date | null | undefined) => {
    const endTime = exit || new Date();
    const minutes = differenceInMinutes(endTime, entry);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const handleGenerateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedParkingId) return;

    try {
      const parking = parkingLots.find(p => p.id === selectedParkingId);
      if (!parking) return;

      const report: VehicleReport[] = [];

      const q = query(
        collection(db, 'vehicles'),
        where('parkingLotId', '==', selectedParkingId),
        where('exitTime', '>=', startDate),
        where('exitTime', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc => {
        const vehicle = doc.data() as Vehicle;
        const reportItem: VehicleReport = {
          ...vehicle,
          parkingLotName: parking.name,
          duration: calculateDuration(vehicle.entryTime, vehicle.exitTime)
        };
        report.push(reportItem);
      });

      // Implemente a lógica para gerar o relatório
      console.log('Relatório gerado:', report);
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    }
  };

  const getReportData = async () => {
    if (!selectedParkingId || !startDate || !endDate) return [];

    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      const q = query(
        collection(db, 'vehicles'),
        where('parkingLotId', '==', selectedParkingId),
        where('entryTime', '>=', start),
        where('entryTime', '<=', end),
        orderBy('entryTime', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const parkingLot = parkingLots.find(lot => lot.id === selectedParkingId);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          plate: data.plate,
          driver: data.driver,
          entryTime: data.entryTime.toDate(),
          exitTime: data.exitTime?.toDate() || null,
          parkingLotName: parkingLot?.name,
          duration: calculateDuration(data.entryTime.toDate(), data.exitTime?.toDate())
        } as VehicleReport;
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao gerar relatório');
      return [];
    }
  };

  const handleExportToExcel = async (e: React.MouseEvent) => {
    e.preventDefault();
    const data = await getReportData();
    exportToExcel(data, { startDate, endDate });
  };

  const handleExportToPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    const data = await getReportData();
    exportToPDF(data, { startDate, endDate });
  };

  const exportToExcel = (data: VehicleReport[], reportInfo: any) => {
    const parkingLot = parkingLots.find(lot => lot.id === selectedParkingId);
    const reportData = {
      parkingLot: parkingLot?.name || 'Não especificado',
      period: `${format(startDate || new Date(), 'dd/MM/yyyy', { locale: ptBR })} até ${format(endDate || new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
      generatedBy: userData?.fullName || user?.email || 'Usuário',
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    };

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Adiciona o título
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['RELATÓRIO DE MOVIMENTAÇÃO DE VEÍCULOS'],
      [''],
      ['Estacionamento:', reportData.parkingLot],
      ['Período:', reportData.period],
      ['Gerado por:', reportData.generatedBy],
      ['Data de geração:', reportData.generatedAt],
      [''],
      ['']
    ], { origin: 'A1' });

    // Adiciona os dados da tabela
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['PLACA', 'CONDUTOR', 'ENTRADA', 'SAÍDA', 'TEMPO']
    ], { origin: 'A8' });

    XLSX.utils.sheet_add_aoa(worksheet, data.map(item => [
      item.plate,
      item.driver,
      format(item.entryTime, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      item.exitTime ? format(item.exitTime, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      item.duration
    ]), { origin: 'A9' });

    // Define larguras das colunas
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 }
    ];

    // Mescla células do título
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

    // Aplica estilos
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellRef]) continue;

        // Estilo padrão
        worksheet[cellRef].s = {
          font: { sz: 11 },
          alignment: { horizontal: 'center' }
        };

        // Estilos específicos
        if (R === 0) { // Título
          worksheet[cellRef].s = {
            font: { bold: true, sz: 16, color: { rgb: "4F81BD" } },
            alignment: { horizontal: "center" }
          };
        } else if (R >= 2 && R <= 5) { // Cabeçalho
          if (C === 0) { // Labels
            worksheet[cellRef].s = {
              font: { bold: true, color: { rgb: "4F81BD" } },
              alignment: { horizontal: "right" }
            };
          } else if (C === 1) { // Values
            worksheet[cellRef].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "E9EEF6" } },
              alignment: { horizontal: "left" },
              border: {
                left: { style: "thin", color: { rgb: "4F81BD" } },
                right: { style: "thin", color: { rgb: "4F81BD" } },
                top: { style: "thin", color: { rgb: "4F81BD" } },
                bottom: { style: "thin", color: { rgb: "4F81BD" } }
              }
            };
          }
        } else if (R === 7) { // Cabeçalhos da tabela
          worksheet[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center" },
            border: {
              left: { style: "thin" },
              right: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "thin" }
            }
          };
        } else if (R >= 8) { // Dados da tabela
          worksheet[cellRef].s = {
            alignment: { horizontal: C === 0 ? "left" : "center" },
            border: {
              left: { style: "thin" },
              right: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "thin" }
            }
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    XLSX.writeFile(workbook, `relatorio-${reportData.parkingLot}-${format(new Date(), 'dd-MM-yyyy-HH-mm')}.xlsx`);
    toast.success('Relatório Excel gerado com sucesso!');
  };

  const exportToPDF = (data: VehicleReport[], reportInfo: any) => {
    const parkingLot = parkingLots.find(lot => lot.id === selectedParkingId);
    const reportData = {
      parkingLot: parkingLot?.name || 'Não especificado',
      period: `${format(startDate || new Date(), 'dd/MM/yyyy', { locale: ptBR })} até ${format(endDate || new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
      generatedBy: userData?.fullName || user?.email || 'Usuário',
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    };

    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(16);
    doc.text('Relatório de Movimentação de Veículos', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Estacionamento: ${reportData.parkingLot}`, 14, 30);
    doc.text(`Período: ${reportData.period}`, 14, 37);
    doc.text(`Gerado por: ${reportData.generatedBy}`, 14, 44);
    doc.text(`Gerado em: ${reportData.generatedAt}`, 14, 51);

    // Tabela
    const tableData = data.map(item => [
      item.plate,
      item.driver,
      format(item.entryTime, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      item.exitTime ? format(item.exitTime, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      item.duration
    ]);

    (doc as any).autoTable({
      startY: 60,
      head: [['Placa', 'Condutor', 'Entrada', 'Saída', 'Tempo']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`relatorio-${reportData.parkingLot}-${format(new Date(), 'dd-MM-yyyy-HH-mm')}.pdf`);
    toast.success('Relatório PDF gerado com sucesso!');
  };

  const renderBreadcrumbs = () => {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Configurações / {views[currentView]}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
     
      case 'manage':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Adicionar Novo Estacionamento
              </h2>
              <form onSubmit={handleAddParkingLot} className="mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="parkingName"
                    placeholder="Nome do estacionamento"
                    required
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>

              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Seus Estacionamentos
              </h2>

              <div className="border-t border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {parkingLots.map((lot) => (
                    <div key={lot.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {lot.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lot.ownerId === user?.uid ? (
                              <span className="text-green-600 dark:text-green-400">
                                Proprietário
                              </span>
                            ) : (
                              <span className="text-blue-600 dark:text-blue-400">
                                Acesso Compartilhado
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {lot.ownerId === user?.uid ? (
                            <div className="flex items-center space-x-2">
                              <button onClick={() => openShareModal(lot.id)}>
                                <Share2 className="h-4 w-4 mr-1" />
                                Compartilhar
                              </button>
                              <button 
                                onClick={() => {
                                  setParkingToDelete(lot.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setParkingToRemove(lot.id);
                                setShowRemoveAccessModal(true);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover Meu Acesso
                            </button>
                          )}
                        </div>
                      </div>

                      {lot.sharedWith?.length > 0 && lot.ownerId === user?.uid && (
                        <div className="mt-2">
                          <p>Compartilhado com:</p>
                          <div className="flex flex-wrap gap-2">
                            {lot.sharedWith.map((email) => (
                              <div key={email}>
                                <span>{email}</span>
                                <button onClick={() => removeSharedAccess(lot.id, email)}>
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'view':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                  <Car className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Visualizar Pátio
                </h2>
              </div>

              <div className="space-y-4">
                <select
                  value={selectedParkingId || ''}
                  onChange={(e) => setSelectedParkingId(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Selecione um estacionamento</option>
                  {parkingLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name}
                    </option>
                  ))}
                </select>

                {selectedParkingId && <VehiclesListComponent parkingLotId={selectedParkingId} />}
              </div>
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                  <FileSpreadsheet className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Relatório
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estacionamento
                    </label>
                    <select
                      value={selectedParkingId || ''}
                      onChange={(e) => setSelectedParkingId(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="">Selecione um estacionamento</option>
                      {parkingLots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          {lot.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Inicial
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date || new Date())}
                      locale="pt-BR"
                      dateFormat="dd/MM/yyyy"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                      wrapperClassName="block w-full"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Final
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date || new Date())}
                      locale="pt-BR"
                      dateFormat="dd/MM/yyyy"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                      wrapperClassName="block w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleExportToExcel}
                    className="flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all duration-200"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </button>
                  <button
                    onClick={handleExportToPDF}
                    className="flex items-center px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </button>
                </div>

                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  {reportData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Placa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Condutor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Entrada
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Saída
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Tempo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {reportData.map((vehicle, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {vehicle.plate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {vehicle.driver}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {format(vehicle.entryTime, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {vehicle.exitTime ? format(vehicle.exitTime, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {vehicle.duration}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nenhum registro encontrado
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Não foram encontrados registros para o período e estacionamento selecionados.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'charts':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                  <ChartIcon className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Análise e Estatísticas
                </h2>
              </div>

              <div className="flex gap-4">
                <select
                  value={selectedParkingId || ''}
                  onChange={(e) => setSelectedParkingId(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                >
                  <option value="">Todos os Estacionamentos</option>
                  {parkingLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>{lot.name}</option>
                  ))}
                </select>

                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                >
                  <option value="today">Hoje</option>
                  <option value="week">Última Semana</option>
                  <option value="month">Último Mês</option>
                  <option value="year">Último Ano</option>
                </select>
              </div>
            </div>

            {isLoadingCharts ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Total de Veículos Hoje</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVehicles}</p>
                  <span className={`text-sm ${compareWithYesterday > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {compareWithYesterday}% vs ontem
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Total de Veículos no Período</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.length}</p>
                </div>

                {/* Gráfico de Movimentação */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Movimentação por Hora</h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={movimentacaoPorHora}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hora" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="entradas" fill="#22c55e" />
                        <Bar dataKey="saidas" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Tempo Médio */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Tempo Médio de Permanência</h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempoMedioPermanencia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="tempo" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Ocupação */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Ocupação por Dia da Semana</h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ocupacaoPorDia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ocupacao" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Pizza */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Distribuição de Tempo</h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ocupacaoPorEstacionamento}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ocupacaoPorEstacionamento.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-600 dark:text-gray-300">
              Esta seção está em desenvolvimento.
            </p>
          </div>
        );
    }
  };

  const loadChartData = async () => {
    try {
      setIsLoadingCharts(true);
      if (!user) return;

      const startDate = getStartDateByPeriod(period);
      const endDate = new Date();

      let parkingLotIds = [];
      if (selectedParkingId) {
        parkingLotIds = [selectedParkingId];
      } else {
        const [ownerSnapshot, sharedSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'parkingLots'), where('ownerId', '==', user.uid))),
          getDocs(query(collection(db, 'parkingLots'), where('sharedWith', 'array-contains', user.email)))
        ]);
        parkingLotIds = [...ownerSnapshot.docs, ...sharedSnapshot.docs].map(doc => doc.id);
      }

      // Carregar total de veículos no período
      const periodQuery = query(
        collection(db, 'vehicles'),
        where('parkingLotId', 'in', parkingLotIds),
        where('entryTime', '>=', startDate),
        where('entryTime', '<=', endDate)
      );
      const periodSnapshot = await getDocs(periodQuery);
      setReportData(periodSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          plate: data.plate,
          driver: data.driver,
          entryTime: data.entryTime.toDate(),
          exitTime: data.exitTime?.toDate() || null,
          parkingLotName: parkingLots.find(lot => lot.id === data.parkingLotId)?.name,
          duration: calculateDuration(data.entryTime.toDate(), data.exitTime?.toDate())
        } as VehicleReport;
      }));

      // Atualizar getMovimentacaoPorHora para usar o período correto
      const dadosMovimentacao = await getMovimentacaoPorHora(parkingLotIds, startDate, endDate);
      setMovimentacaoPorHora(dadosMovimentacao);

      // Carregar ocupação atual
      const ocupacaoData = await getOcupacaoPorEstacionamento(parkingLotIds, parkingLots);
      setOcupacaoPorEstacionamento(ocupacaoData);

      // Carregar totais
      const { total, comparacao } = await getTotaisVeiculos(parkingLotIds, startDate);
      setTotalVehicles(total);
      setCompareWithYesterday(comparacao);

      // Carregar ocupação por dia
      const ocupacaoDiaria = await getOcupacaoPorDia(parkingLotIds, startDate, endDate);
      setOcupacaoPorDia(ocupacaoDiaria);

    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
      toast.error('Erro ao carregar dados dos gráficos');
    } finally {
      setIsLoadingCharts(false);
    }
  };

  const calcularTempoMedioPermanencia = async () => {
    // ... lógica para calcular o tempo médio de permanência
    const dados = [
      { name: 'Seg', tempo: 120 },
      { name: 'Ter', tempo: 150 },
      { name: 'Qua', tempo: 180 },
      { name: 'Qui', tempo: 140 },
      { name: 'Sex', tempo: 160 },
      { name: 'Sáb', tempo: 90 },
      { name: 'Dom', tempo: 70 }
    ];
    setTempoMedioPermanencia(dados);
  };

  useEffect(() => {
    if (currentView === 'charts') {
      loadChartData();
      calcularTempoMedioPermanencia();
    }
  }, [currentView, selectedParkingId, period]);

  // Adicionar useEffect para carregar relatório quando os filtros mudarem
  useEffect(() => {
    const loadReport = async () => {
      if (!selectedParkingId || !startDate || !endDate) return;

      try {
        const data = await getReportData();
        setReportData(data);
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        toast.error('Erro ao carregar relatório');
      }
    };

    loadReport();
  }, [selectedParkingId, startDate, endDate]); // Dependências do useEffect

  // No componente Settings, adicionar opção para voltar à Dashboard
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      {renderBreadcrumbs()}
      <Link
        to="/"
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar para Dashboard
      </Link>
    </div>
  );

  const removeSharedAccess = async (parkingId: string, email: string) => {
    try {
      const parkingRef = doc(db, 'parkingLots', parkingId);
      const parkingDoc = await getDoc(parkingRef);
      
      if (parkingDoc.exists()) {
        const parkingData = parkingDoc.data();
        const updatedSharedWith = parkingData.sharedWith.filter(
          (e: string) => e !== email
        );
        
        await updateDoc(parkingRef, {
          sharedWith: updatedSharedWith
        });
        
        toast.success('Acesso removido com sucesso');
        loadParkingLots();
      }
    } catch (error) {
      console.error('Erro ao remover acesso:', error);
      toast.error('Erro ao remover acesso');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <SettingsIcon className="h-5 w-5 text-orange-500 mr-2" />
                Configurações
              </h2>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setCurrentView('manage')}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'manage'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                  <span>Gerenciar Estacionamentos</span>
                </button>

                <button
                  onClick={() => setCurrentView('report')}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'report'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Relatório</span>
                </button>

                <button
                  onClick={() => setCurrentView('view')}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'view'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Car className="h-5 w-5" />
                  <span>Visualizar Pátio</span>
                </button>

                <button
                  onClick={() => setCurrentView('charts')}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition-colors ${
                    currentView === 'charts'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChartIcon className="h-5 w-5" />
                  <span>Gráficos</span>
                </button>
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/dashboard"
                  className="w-full flex items-center px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeftCircleIcon className="h-5 w-5 mr-2" />
                  <span>Voltar</span>
                </Link>
              </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              {currentView === 'manage' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                      <Building2 className="h-6 w-6 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Gerenciar Estacionamentos
                    </h2>
                  </div>

                  {/* Formulário e Lista de Estacionamentos */}
                  <div className="space-y-6">
                    <form onSubmit={handleAddParkingLot} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nome do estacionamento
                        </label>
                        <input
                          type="text"
                          name="parkingName"
                          placeholder="Nome do estacionamento"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                        >
                          Adicionar
                        </button>
                      </div>
                    </form>

                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {parkingLots.map((lot) => (
                          <div key={lot.id} className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {lot.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {lot.ownerId === user?.uid ? (
                                    <span className="text-green-600 dark:text-green-400">
                                      Proprietário
                                    </span>
                                  ) : (
                                    <span className="text-blue-600 dark:text-blue-400">
                                      Acesso Compartilhado
                                    </span>
                                  )}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {lot.ownerId === user?.uid ? (
                                  <div className="flex items-center space-x-2">
                                    <button onClick={() => openShareModal(lot.id)}>
                                      <Share2 className="h-4 w-4 mr-1" />
                                      Compartilhar
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setParkingToDelete(lot.id);
                                        setShowDeleteModal(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Excluir
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setParkingToRemove(lot.id);
                                      setShowRemoveAccessModal(true);
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Remover Meu Acesso
                                  </button>
                                )}
                              </div>
                            </div>

                            {lot.sharedWith?.length > 0 && lot.ownerId === user?.uid && (
                              <div className="mt-2">
                                <p>Compartilhado com:</p>
                                <div className="flex flex-wrap gap-2">
                                  {lot.sharedWith.map((email) => (
                                    <div key={email}>
                                      <span>{email}</span>
                                      <button onClick={() => removeSharedAccess(lot.id, email)}>
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'report' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                      <FileSpreadsheet className="h-6 w-6 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Relatório
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Estacionamento
                        </label>
                        <select
                          value={selectedParkingId || ''}
                          onChange={(e) => setSelectedParkingId(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                        >
                          <option value="">Selecione um estacionamento</option>
                          {parkingLots.map((lot) => (
                            <option key={lot.id} value={lot.id}>
                              {lot.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Inicial
                        </label>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date || new Date())}
                          locale="pt-BR"
                          dateFormat="dd/MM/yyyy"
                          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                          wrapperClassName="block w-full"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Final
                        </label>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date || new Date())}
                          locale="pt-BR"
                          dateFormat="dd/MM/yyyy"
                          className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                          wrapperClassName="block w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleExportToExcel}
                        className="flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all duration-200"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </button>
                      <button
                        onClick={handleExportToPDF}
                        className="flex items-center px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </button>
                    </div>

                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                      {reportData.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Placa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Condutor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Entrada
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Saída
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Tempo
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {reportData.map((vehicle, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {vehicle.plate}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {vehicle.driver}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {format(vehicle.entryTime, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {vehicle.exitTime ? format(vehicle.exitTime, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {vehicle.duration}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nenhum registro encontrado
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            Não foram encontrados registros para o período e estacionamento selecionados.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'view' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                      <Car className="h-6 w-6 text-orange-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Visualizar Pátio
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <select
                      value={selectedParkingId || ''}
                      onChange={(e) => setSelectedParkingId(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="">Selecione um estacionamento</option>
                      {parkingLots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          {lot.name}
                        </option>
                      ))}
                    </select>

                    {selectedParkingId && <VehiclesListComponent parkingLotId={selectedParkingId} />}
                  </div>
                </div>
              )}

              {currentView === 'charts' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-orange-100 dark:bg-orange-500/10 p-2 rounded-lg mr-3">
                        <ChartIcon className="h-6 w-6 text-orange-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Análise e Estatísticas
                      </h2>
                    </div>

                    <div className="flex gap-4">
                      <select
                        value={selectedParkingId || ''}
                        onChange={(e) => setSelectedParkingId(e.target.value)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                      >
                        <option value="">Todos os Estacionamentos</option>
                        {parkingLots.map((lot) => (
                          <option key={lot.id} value={lot.id}>{lot.name}</option>
                        ))}
                      </select>

                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                      >
                        <option value="today">Hoje</option>
                        <option value="week">Última Semana</option>
                        <option value="month">Último Mês</option>
                        <option value="year">Último Ano</option>
                      </select>
                    </div>
                  </div>

                  {isLoadingCharts ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-sm text-gray-500 dark:text-gray-400">Total de Veículos Hoje</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVehicles}</p>
                        <span className={`text-sm ${compareWithYesterday > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {compareWithYesterday}% vs ontem
                        </span>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-sm text-gray-500 dark:text-gray-400">Total de Veículos no Período</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.length}</p>
                      </div>

                      {/* Gráfico de Movimentação */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Movimentação por Hora</h3>
                        <div className="w-full h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={movimentacaoPorHora}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="hora" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="entradas" fill="#22c55e" />
                              <Bar dataKey="saidas" fill="#ef4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Gráfico de Tempo Médio */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Tempo Médio de Permanência</h3>
                        <div className="w-full h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={tempoMedioPermanencia}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="tempo" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Gráfico de Ocupação */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Ocupação por Dia da Semana</h3>
                        <div className="w-full h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ocupacaoPorDia}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="dia" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="ocupacao" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Gráfico de Pizza */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Distribuição de Tempo</h3>
                        <div className="w-full h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={ocupacaoPorEstacionamento}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {ocupacaoPorEstacionamento.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Compartilhar Acesso
            </h3>
            
            <form onSubmit={handleShareParkingLot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email do usuário
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  placeholder="usuario@email.com"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setSelectedParkingId(null);
                    setShareEmail('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Compartilhar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Remover Acesso */}
      {showRemoveAccessModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Remoção de Acesso
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Tem certeza que deseja remover seu acesso a este estacionamento?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRemoveAccessModal(false);
                  setParkingToRemove(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (parkingToRemove) {
                    await handleRemoveAccess(parkingToRemove);
                    setShowRemoveAccessModal(false);
                    setParkingToRemove(null);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Remover Acesso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Excluir Estacionamento */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir este estacionamento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setParkingToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (parkingToDelete) {
                    await handleDeleteParkingLot(parkingToDelete);
                    setShowDeleteModal(false);
                    setParkingToDelete(null);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return numbers.slice(0, 11);
};

const formatDocument = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
};

const formatDateForInput = (date: string) => {
  if (!date) return '';
  try {
    if (date.includes('/')) {
      const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
      return format(parsedDate, 'yyyy-MM-dd');
    }
    return format(parseISO(date), 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

const formatDateForDisplay = (date: Date) => {
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

// Função auxiliar para determinar a data inicial baseada no período
const getStartDateByPeriod = (period: string): Date => {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'week':
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      return lastWeek;
    case 'month':
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return lastMonth;
    case 'year':
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      return lastYear;
    default:
      return new Date(now.setHours(0, 0, 0, 0));
  }
};

// Funções auxiliares para cada tipo de dado
const getMovimentacaoPorHora = async (parkingLotIds: string[], startDate: Date, endDate: Date) => {
  try {
    const dadosMovimentacao = [];
    const horaAtual = new Date().getHours();

    for (let i = 0; i < 24; i++) {
      const hora = (horaAtual - i + 24) % 24;
      const horaInicio = new Date();
      horaInicio.setHours(hora, 0, 0, 0);
      const horaFim = new Date();
      horaFim.setHours(hora + 1, 0, 0, 0);

      const vehiclesQuery = query(
        collection(db, 'vehicles'),
        where('parkingLotId', 'in', parkingLotIds),
        where('entryTime', '>=', horaInicio),
        where('entryTime', '<', horaFim)
      );

      const snapshot = await getDocs(vehiclesQuery);
      const entradas = snapshot.docs.length;
      const saidas = snapshot.docs.filter(doc => doc.data().exitTime).length;

      dadosMovimentacao.unshift({
        hora: `${hora}h`,
        entradas,
        saidas
      });
    }

    return dadosMovimentacao;
  } catch (error) {
    console.error('Erro ao carregar movimentação:', error);
    return [];
  }
};

const getOcupacaoPorEstacionamento = async (parkingLotIds: string[], parkingLots: ParkingLot[]) => {
  try {
    const ocupacaoData = await Promise.all(
      parkingLotIds.map(async (parkingId) => {
        const lot = parkingLots.find((l: ParkingLot) => l.id === parkingId);
        const vehiclesQuery = query(
          collection(db, 'vehicles'),
          where('parkingLotId', '==', parkingId),
          where('exitTime', '==', null)
        );
        const vehiclesSnapshot = await getDocs(vehiclesQuery);
        
        return {
          name: lot?.name || 'Desconhecido',
          value: vehiclesSnapshot.docs.length
        };
      })
    );
    
    return ocupacaoData;
  } catch (error) {
    console.error('Erro ao carregar ocupação:', error);
    return [];
  }
};

const getTotaisVeiculos = async (parkingLotIds: string[], startDate: Date) => {
  try {
    // Total de hoje
    const today = new Date(startDate);
    today.setHours(0, 0, 0, 0);
    
    const todayQuery = query(
      collection(db, 'vehicles'),
      where('parkingLotId', 'in', parkingLotIds),
      where('entryTime', '>=', today)
    );
    
    // Total de ontem
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayQuery = query(
      collection(db, 'vehicles'),
      where('parkingLotId', 'in', parkingLotIds),
      where('entryTime', '>=', yesterday),
      where('entryTime', '<', today)
    );

    const [todaySnapshot, yesterdaySnapshot] = await Promise.all([
      getDocs(todayQuery),
      getDocs(yesterdayQuery)
    ]);

    const totalHoje = todaySnapshot.docs.length;
    const totalOntem = yesterdaySnapshot.docs.length;

    const comparacao = totalOntem === 0 
      ? 100 
      : Math.round(((totalHoje - totalOntem) / totalOntem) * 100);

    return {
      total: totalHoje,
      comparacao
    };
  } catch (error) {
    console.error('Erro ao carregar totais:', error);
    return { total: 0, comparacao: 0 };
  }
};

const getOcupacaoPorDia = async (parkingLotIds: string[], startDate: Date, endDate: Date) => {
  try {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const ocupacaoPorDia = diasSemana.map(dia => ({ dia, ocupacao: 0 }));

    for (const parkingId of parkingLotIds) {
      const vehiclesQuery = query(
        collection(db, 'vehicles'),
        where('parkingLotId', '==', parkingId),
        where('entryTime', '>=', startDate),
        where('entryTime', '<=', endDate)
      );

      const snapshot = await getDocs(vehiclesQuery);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const diaSemana = new Date(data.entryTime.toDate()).getDay();
        ocupacaoPorDia[diaSemana].ocupacao++;
      });
    }

    return ocupacaoPorDia;
  } catch (error) {
    console.error('Erro ao carregar ocupação por dia:', error);
    return [];
  }
};

// ... adicionar loading state ...