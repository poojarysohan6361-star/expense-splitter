import React from 'react';
import { Utensils, Car, ShoppingCart, Film } from 'lucide-react';

export default function RecentExpenses({ expenses, onViewAll }) {
  const defaultExpenses = [
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
  ];

  const items = expenses && expenses.length > 0 ? expenses : defaultExpenses;

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Recent Expenses</h2>
        <button
          style={styles.viewAllBtn}
          onClick={onViewAll}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#C084FC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#A855F7';
          }}
        >
          View All
        </button>
      </div>

      {/* Expense List */}
      <div style={styles.list}>
        {items.map((item, index) => {
          const IconComp = item.icon || Utensils;
          return (
            <div
              key={item.id || index}
              style={{
                ...styles.itemRow,
                ...(index === items.length - 1 ? styles.itemRowLast : {}),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Category Icon */}
              <div style={styles.iconContainer}>
                <IconComp size={19} color="#FF6B4A" strokeWidth={2.2} />
              </div>

              {/* Title & Date */}
              <div style={styles.details}>
                <div style={styles.itemTitle}>{item.title || item.description}</div>
                <div style={styles.itemDate}>{item.date || 'Recent'}</div>
              </div>

              {/* Amount */}
              <div style={styles.amount}>{item.amount}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#11162A',
    borderRadius: '18px',
    padding: '24px 28px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
    margin: 0,
  },
  viewAllBtn: {
    color: '#A855F7',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '4px 6px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 10px',
    borderRadius: '12px',
    transition: 'background-color 0.15s ease',
  },
  itemRowLast: {
    paddingBottom: '8px',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '11px',
    backgroundColor: 'rgba(234, 88, 12, 0.16)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    flexShrink: 0,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: '14.5px',
    fontWeight: '600',
    letterSpacing: '-0.1px',
    lineHeight: 1.2,
  },
  itemDate: {
    color: '#717D96',
    fontSize: '12px',
    marginTop: '3px',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
  },
};
