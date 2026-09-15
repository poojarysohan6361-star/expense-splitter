import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function AddExpenseModal({
  isOpen,
  onClose,
  groups = [],
  onAddExpenseSuccess,
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '1');
  const [splitType, setSplitType] = useState('equal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please enter an expense description');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      if (onAddExpenseSuccess) {
        await onAddExpenseSuccess({
          description: description.trim(),
          amount: parseFloat(amount).toFixed(2),
          groupId: Number(groupId),
          splitType,
          paidBy: 1, // Default to Sohan
          createdAt: new Date().toISOString(),
        });
      }
      onClose();
      setDescription('');
      setAmount('');
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header}>
          <h2 style={styles.modalTitle}>Add New Expense</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#8E9CAE" />
          </button>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description</label>
            <input
              type="text"
              placeholder="e.g. Dinner, Uber, Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.input}
              required
              autoFocus
            />
          </div>

          <div style={styles.rowTwo}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Amount (₹)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Group</label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                style={styles.select}
              >
                {groups.length > 0 ? (
                  groups.map((g) => (
                    <option key={g.id} value={g.id} style={styles.option}>
                      {g.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1" style={styles.option}>Goa Trip</option>
                    <option value="2" style={styles.option}>Roommates</option>
                    <option value="3" style={styles.option}>College Project</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Split Type</label>
            <div style={styles.splitToggleGroup}>
              {['equal', 'exact', 'percentage', 'shares'].map((type) => (
                <button
                  type="button"
                  key={type}
                  style={{
                    ...styles.splitBtn,
                    ...(splitType === type ? styles.splitBtnActive : {}),
                  }}
                  onClick={() => setSplitType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? (
                'Adding...'
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Save Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(5, 7, 13, 0.78)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    backgroundColor: '#11162A',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    borderRadius: '18px',
    padding: '28px',
    width: '460px',
    maxWidth: '92vw',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
  },
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#F43F5E',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#8E9CAE',
    fontSize: '12.5px',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  option: {
    backgroundColor: '#151B32',
    color: '#FFFFFF',
  },
  splitToggleGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
    backgroundColor: '#151B32',
    padding: '4px',
    borderRadius: '10px',
  },
  splitBtn: {
    padding: '7px 4px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#8E9CAE',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  splitBtnActive: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '10px 16px',
    borderRadius: '10px',
    color: '#8E9CAE',
    fontSize: '13.5px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
  },
};
