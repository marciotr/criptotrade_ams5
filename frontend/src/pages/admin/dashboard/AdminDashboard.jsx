import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Coins, ArrowUp, ArrowDown, DollarSign, LineChart, Activity } from 'lucide-react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { useTheme } from '../../../context/ThemeContext';

// Registro dos componentes necessários para o Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

export function AdminDashboard() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCoins: 0,
    totalTransactions: 0,
    totalVolume: 0
  });
  
  const [userGrowthData, setUserGrowthData] = useState({ labels: [], data: [] });
  const [coinDistribution, setCoinDistribution] = useState({ labels: [], data: [] });
  const [transactionHistory, setTransactionHistory] = useState({ labels: [], data: [] });
  
  // Cores para os gráficos baseadas no tema
  const textColor = theme === 'light' ? '#334155' : '#94a3b8';
  const gridColor = theme === 'light' ? 'rgba(203, 213, 225, 0.5)' : 'rgba(71, 85, 105, 0.3)';
  const brandColor = '#3b82f6';
  const brandColorLight = 'rgba(59, 130, 246, 0.5)';
  
  // Simulação de dados para demonstração
  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalUsers: 5847,
        activeUsers: 2156,
        totalCoins: 128,
        totalTransactions: 34729,
        totalVolume: 8743290
      });
      
      setUserGrowthData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [1200, 1900, 2400, 3200, 4700, 5847]
      });
      
      setCoinDistribution({
        labels: ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Polkadot', 'Others'],
        data: [45, 30, 10, 5, 5, 5]
      });
      
      setTransactionHistory({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [5200, 7800, 12400, 18700, 26500, 34729]
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);

  // Configurações dos gráficos
  const userGrowthChartData = {
    labels: userGrowthData.labels,
    datasets: [
      {
        label: 'Total Users',
        data: userGrowthData.data,
        backgroundColor: brandColorLight,
        borderColor: brandColor,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: brandColor
      }
    ]
  };
  
  const coinDistributionChartData = {
    labels: coinDistribution.labels,
    datasets: [
      {
        data: coinDistribution.data,
        backgroundColor: [
          '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f97316', '#6366f1'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const transactionChartData = {
    labels: transactionHistory.labels,
    datasets: [
      {
        label: 'Transactions',
        data: transactionHistory.data,
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        borderWidth: 1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      }
    }
  };

  // Opções para o gráfico de pizza
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: textColor
        }
      }
    }
  };

  // Animação de entrada para componentes
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="w-full px-6 py-6" // Removido container e max-w para ocupar toda largura
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            when: "beforeChildren",
            staggerChildren: 0.1
          } 
        }
      }}
    >
      <motion.div
        variants={fadeInUp}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary">Platform overview and statistics</p>
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8" // Reduzido o gap para encaixar melhor
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { 
              staggerChildren: 0.05
            } 
          }
        }}
      >
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5"
        >
          <div className="flex items-center mb-3">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2 mr-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-text-secondary font-medium">Total Users</h3>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? "—" : stats.totalUsers.toLocaleString()}
            </p>
            <span className="ml-2 text-sm flex items-center text-green-500">
              <ArrowUp className="h-3 w-3 mr-0.5" />
              24%
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5"
        >
          <div className="flex items-center mb-3">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2 mr-3">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-text-secondary font-medium">Active Users</h3>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? "—" : stats.activeUsers.toLocaleString()}
            </p>
            <span className="ml-2 text-sm flex items-center text-green-500">
              <ArrowUp className="h-3 w-3 mr-0.5" />
              12%
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5"
        >
          <div className="flex items-center mb-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2 mr-3">
              <Coins className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-text-secondary font-medium">Listed Coins</h3>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? "—" : stats.totalCoins.toLocaleString()}
            </p>
            <span className="ml-2 text-sm flex items-center text-green-500">
              <ArrowUp className="h-3 w-3 mr-0.5" />
              5
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5"
        >
          <div className="flex items-center mb-3">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2 mr-3">
              <LineChart className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-text-secondary font-medium">Transactions</h3>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? "—" : stats.totalTransactions.toLocaleString()}
            </p>
            <span className="ml-2 text-sm flex items-center text-green-500">
              <ArrowUp className="h-3 w-3 mr-0.5" />
              18%
            </span>
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5"
        >
          <div className="flex items-center mb-3">
            <div className="rounded-lg bg-rose-100 dark:bg-rose-900/30 p-2 mr-3">
              <DollarSign className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-text-secondary font-medium">Total Volume</h3>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-text-primary">
              {isLoading ? "—" : `$${(stats.totalVolume/1000000).toFixed(1)}M`}
            </p>
            <span className="ml-2 text-sm flex items-center text-red-500">
              <ArrowDown className="h-3 w-3 mr-0.5" />
              3%
            </span>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"> {/* Reduzido gap e margem */}
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5"
        >
          <h3 className="text-xl font-semibold text-text-primary mb-4">User Growth</h3>
          <div className="h-72"> {/* Ajustada altura para ser mais compacta */}
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <Line data={userGrowthChartData} options={chartOptions} />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5"
        >
          <h3 className="text-xl font-semibold text-text-primary mb-4">Transaction History</h3>
          <div className="h-72"> {/* Ajustada altura para ser mais compacta */}
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <Bar data={transactionChartData} options={chartOptions} />
            )}
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* Reduzido gap */}
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5 lg:col-span-1"
        >
          <h3 className="text-xl font-semibold text-text-primary mb-4">Coin Distribution</h3>
          <div className="h-72"> {/* Ajustada altura para ser mais compacta */}
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <Pie data={coinDistributionChartData} options={pieChartOptions} />
            )}
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="bg-background-secondary rounded-xl shadow-md p-5 lg:col-span-2"
        >
          <h3 className="text-xl font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-text-primary">
              <thead>
                <tr className="border-b border-border-primary">
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-primary">
                  <td className="py-3 px-4">John Doe</td>
                  <td className="py-3 px-4">Deposit</td>
                  <td className="py-3 px-4">$2,500</td>
                  <td className="py-3 px-4">Jun 22, 2025</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">Completed</span></td>
                </tr>
                <tr className="border-b border-border-primary">
                  <td className="py-3 px-4">Alice Smith</td>
                  <td className="py-3 px-4">Withdrawal</td>
                  <td className="py-3 px-4">$1,200</td>
                  <td className="py-3 px-4">Jun 21, 2025</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs">Processing</span></td>
                </tr>
                <tr className="border-b border-border-primary">
                  <td className="py-3 px-4">Mark Johnson</td>
                  <td className="py-3 px-4">Trade</td>
                  <td className="py-3 px-4">$3,750</td>
                  <td className="py-3 px-4">Jun 21, 2025</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">Completed</span></td>
                </tr>
                <tr className="border-b border-border-primary">
                  <td className="py-3 px-4">Sarah Williams</td>
                  <td className="py-3 px-4">Deposit</td>
                  <td className="py-3 px-4">$5,000</td>
                  <td className="py-3 px-4">Jun 20, 2025</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">Failed</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Robert Brown</td>
                  <td className="py-3 px-4">Withdrawal</td>
                  <td className="py-3 px-4">$900</td>
                  <td className="py-3 px-4">Jun 20, 2025</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;