import React from 'react';
import { Wallet, ReceiptText } from 'lucide-react';

export default function TotalBalanceCard({
  totalBalance = '₹4,820',
  youOwe = '₹1,240',
  owedToYou = '₹820',
  groupExpenses = '₹2,060',
  onWalletClick,
  onReceiptClick,
}) {
  return (
    <div style={styles.cardContainer}>
      {/* Top Row: Balance Header & Action Buttons */}
      <div style={styles.topRow}>
        <div style={styles.balanceInfo}>
          <div style={styles.balanceLabel}>TOTAL BALANCE</div>
          <div style={styles.balanceValue}>{totalBalance}</div>
        </div>

        <div style={styles.actionsGroup}>
          <button
            style={styles.actionBtn}
            onClick={onWalletClick}
            title="Wallet"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
              e.currentTarget.style.backgroundColor = '#1C2340';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.backgroundColor = '#151B32';
            }}
          >
            <Wallet size={20} color="#9D4EDD" strokeWidth={2} />
          </button>

          <button
            style={styles.actionBtn}
            onClick={onReceiptClick}
            title="Receipts"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
              e.currentTarget.style.backgroundColor = '#1C2340';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.backgroundColor = '#151B32';
            }}
          >
            <ReceiptText size={20} color="#F59E0B" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Bottom Sub Cards: 3 Breakdown Metrics */}
      <div style={styles.metricsGrid}>
        {/* You Owe */}
        <div style={styles.oweCard}>
          <div style={styles.oweLabel}>You Owe</div>
          <div style={styles.oweValue}>{youOwe}</div>
        </div>

        {/* Owed to You */}
        <div style={styles.owedToYouCard}>
          <div style={styles.owedToYouLabel}>Owed to You</div>
          <div style={styles.owedToYouValue}>{owedToYou}</div>
        </div>

        {/* Group Expenses */}
        <div style={styles.groupExpCard}>
          <div style={styles.groupExpLabel}>Group Expenses</div>
          <div style={styles.groupExpValue}>{groupExpenses}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  cardContainer: {
    backgroundColor: '#101528',
    borderRadius: '18px',
    padding: '28px 32px',
    marginBottom: '24px',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    boxShadow: '0 0 35px -8px rgba(124, 58, 237, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  balanceInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  balanceLabel: {
    color: '#7C89A0',
    fontSize: '11.5px',
    fontWeight: '700',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: '40px',
    fontWeight: '800',
    letterSpacing: '-0.6px',
    lineHeight: 1.1,
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  actionBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '11px',
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  oweCard: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.24)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
  },
  oweLabel: {
    color: '#D47385',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
  },
  oweValue: {
    color: '#F43F5E',
    fontSize: '23px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  owedToYouCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.24)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
  },
  owedToYouLabel: {
    color: '#5DAF9C',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
  },
  owedToYouValue: {
    color: '#10B981',
    fontSize: '23px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  groupExpCard: {
    backgroundColor: '#141A2E',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
  },
  groupExpLabel: {
    color: '#7C89A0',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
  },
  groupExpValue: {
    color: '#FFFFFF',
    fontSize: '23px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
};
