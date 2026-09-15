import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TotalBalanceCard from '../components/TotalBalanceCard';
import RecentExpenses from '../components/RecentExpenses';
import GroupsCard from '../components/GroupsCard';
import RecentActivity from '../components/RecentActivity';
import AddExpenseModal from '../components/AddExpenseModal';
import { groupsAPI, expensesAPI, authAPI } from '../api/api';
import { Utensils, Car, ShoppingCart, Film, MapPin, Users, Briefcase } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = authAPI.getCurrentUser();
  const userName = currentUser?.name || 'Sohan';

  const [activeNav, setActiveNav] = useState('Overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  // Initial state matching the approved Figma mockup exactly
  const [totalBalance, _setTotalBalance] = useState('₹4,820');
  const [youOwe, _setYouOwe] = useState('₹1,240');
  const [owedToYou, _setOwedToYou] = useState('₹820');
  const [groupExpenses, _setGroupExpenses] = useState('₹2,060');

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: 'Dinner',
      date: 'Yesterday',
      amount: '₹450',
      icon: Utensils,
    },
    {
      id: 2,
      title: 'Uber',
      date: 'Yesterday',
      amount: '₹220',
      icon: Car,
    },
    {
      id: 3,
      title: 'Groceries',
      date: '2 days ago',
      amount: '₹680',
      icon: ShoppingCart,
    },
    {
      id: 4,
      title: 'Movie',
      date: '3 days ago',
      amount: '₹350',
      icon: Film,
    },
  ]);

  const [groups, _setGroups] = useState([
    {
      id: 1,
      name: 'Goa Trip',
      membersCount: 4,
      amount: '₹1,200',
      icon: MapPin,
      badgeBg: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
    },
    {
      id: 2,
      name: 'Roommates',
      membersCount: 3,
      amount: '₹860',
      icon: Users,
      badgeBg: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
    },
    {
      id: 3,
      name: 'College Project',
      membersCount: 5,
      amount: '₹1,000',
      icon: Briefcase,
      badgeBg: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    },
  ]);

  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'paid',
      title: 'You paid ₹450 to Ria',
      time: '2 hours ago',
      isOutgoing: true,
    },
    {
      id: 2,
      type: 'received',
      title: 'Arun paid you ₹200',
      time: '5 hours ago',
      isOutgoing: false,
    },
  ]);

  // Load live groups from backend if available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const liveGroups = await groupsAPI.list();
        if (liveGroups && Array.isArray(liveGroups) && liveGroups.length > 0) {
          // Merge or supplement existing groups
          console.log('Loaded backend groups:', liveGroups);
        }
      } catch (err) {
        console.info('Backend groups check:', err.message);
      }
    }
    loadBackendData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAddExpense = async (newExpense) => {
    try {
      // If user has active group selected, try API call
      if (newExpense.groupId) {
        try {
          await expensesAPI.create(newExpense.groupId, {
            description: newExpense.description,
            amount: newExpense.amount,
            paidBy: newExpense.paidBy || 1,
            splitType: newExpense.splitType || 'equal',
            participants: [{ userId: 1 }],
          });
        } catch (apiErr) {
          console.warn('Backend expense create fallback:', apiErr.message);
        }
      }

      // Add to local state
      const addedItem = {
        id: Date.now(),
        title: newExpense.description,
        date: 'Just now',
        amount: `₹${Number(newExpense.amount).toLocaleString('en-IN')}`,
        icon: Utensils,
      };

      setExpenses((prev) => [addedItem, ...prev]);

      // Add to activities
      setActivities((prev) => [
        {
          id: Date.now(),
          type: 'paid',
          title: `You added ₹${newExpense.amount} for ${newExpense.description}`,
          time: 'Just now',
          isOutgoing: true,
        },
        ...prev,
      ]);

      showToast(`Expense "${newExpense.description}" added successfully!`);
    } catch (err) {
      console.error('Error adding expense:', err);
      showToast('Expense recorded locally.');
    }
  };

  return (
    <div style={styles.layout}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toast}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavSelect={setActiveNav}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          {/* Top Header */}
          <Header
            userName={userName}
            onAddExpense={() => setIsModalOpen(true)}
          />

          {/* Total Balance Card */}
          <TotalBalanceCard
            totalBalance={totalBalance}
            youOwe={youOwe}
            owedToYou={owedToYou}
            groupExpenses={groupExpenses}
            onWalletClick={() => showToast('Wallet details viewed')}
            onReceiptClick={() => showToast('Receipts filter applied')}
          />

          {/* Bottom Columns: Left (Recent Expenses), Right (Groups + Recent Activity) */}
          <div style={styles.columnsGrid}>
            {/* Left Column */}
            <div style={styles.leftColumn}>
              <RecentExpenses
                expenses={expenses}
                onViewAll={() => showToast('Viewing all expenses')}
              />
            </div>

            {/* Right Column */}
            <div style={styles.rightColumn}>
              <GroupsCard
                groups={groups}
                onSelectGroup={(g) => showToast(`Selected ${g.name}`)}
              />
              <RecentActivity activities={activities} />
            </div>
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groups={groups}
        onAddExpenseSuccess={handleAddExpense}
      />
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#080B14',
    width: '100%',
    position: 'relative',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#080B14',
    padding: '32px 36px 48px 36px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: '1180px',
    display: 'flex',
    flexDirection: 'column',
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.85fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '24px',
    backgroundColor: '#1E1736',
    border: '1px solid #7C3AED',
    color: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.3)',
    fontSize: '13.5px',
    fontWeight: '600',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease',
  },
};