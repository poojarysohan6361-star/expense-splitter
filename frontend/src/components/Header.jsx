import React from 'react';
import { Plus } from 'lucide-react';

export default function Header({ userName = 'Sohan', onAddExpense }) {
  return (
    <header style={styles.header}>
      <div style={styles.textGroup}>
        <div style={styles.subGreeting}>
          Good evening, {userName} <span role="img" aria-label="wave">👋</span>
        </div>
        <h1 style={styles.mainTitle}>Here's your expense overview</h1>
      </div>

      <button
        style={styles.addButton}
        onClick={onAddExpense}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(147, 51, 234, 0.55)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 18px rgba(124, 58, 237, 0.45)';
        }}
      >
        <Plus size={16} strokeWidth={2.6} color="#FFFFFF" />
        <span>Add Expense</span>
      </button>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '26px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  subGreeting: {
    color: '#8E9CAE',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.1px',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: '25px',
    fontWeight: '700',
    letterSpacing: '-0.4px',
    margin: 0,
    lineHeight: 1.25,
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '11px',
    fontSize: '13.5px',
    fontWeight: '600',
    boxShadow: '0 4px 18px rgba(124, 58, 237, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
