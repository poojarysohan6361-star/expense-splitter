import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { groupsAPI } from '../api/api';

export default function AddExpenseModal({
  isOpen,
  onClose,
  groups = [],
  selectedGroupId,
  currentUserId,
  onAddExpenseSuccess,
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState(selectedGroupId || groups[0]?.id || '');
  const [paidBy, setPaidBy] = useState(currentUserId || '');
  const [splitType, setSplitType] = useState('equal');
  const [members, setMembers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [rawValues, setRawValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState('');

  // Sync selected group and fetch members when modal opens or group changes
  useEffect(() => {
    if (!isOpen) return;
    const targetGroupId = selectedGroupId || groups[0]?.id || '';
    setGroupId(targetGroupId);
  }, [isOpen, selectedGroupId, groups]);

  useEffect(() => {
    if (!isOpen || !groupId) return;

    let isMounted = true;
    setLoadingMembers(true);
    groupsAPI
      .getDetails(groupId)
      .then((details) => {
        if (!isMounted) return;
        const groupMembers = details.members || [];
        setMembers(groupMembers);

        // Default payer to current user if a member, otherwise first member
        const hasCurrentUser = groupMembers.some((m) => m.id === currentUserId);
        setPaidBy(hasCurrentUser ? currentUserId : groupMembers[0]?.id || '');

        // Default all members as participants
        setSelectedUserIds(new Set(groupMembers.map((m) => m.id)));

        // Default shares to 1
        const initialRaw = {};
        groupMembers.forEach((m) => {
          initialRaw[m.id] = '';
        });
        setRawValues(initialRaw);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to fetch group members for expense modal:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingMembers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, groupId, currentUserId]);

  if (!isOpen) return null;

  const totalAmountNum = parseFloat(amount) || 0;
  const participantCount = selectedUserIds.size;

  const toggleParticipant = (userId) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setSelectedUserIds(next);
  };

  const handleRawValueChange = (userId, val) => {
    setRawValues((prev) => ({
      ...prev,
      [userId]: val,
    }));
  };

  // Helper calculations for validation and preview
  let allocationStatus = null;
  if (splitType === 'equal' && participantCount > 0 && totalAmountNum > 0) {
    const equalShare = (totalAmountNum / participantCount).toFixed(2);
    allocationStatus = {
      isValid: true,
      text: `₹${equalShare} per person (${participantCount} selected)`,
    };
  } else if (splitType === 'exact') {
    const exactSum = Array.from(selectedUserIds).reduce((acc, uid) => {
      const v = parseFloat(rawValues[uid]) || 0;
      return acc + v;
    }, 0);
    const diff = Math.round((totalAmountNum - exactSum) * 100) / 100;
    const isMatched = Math.abs(diff) < 0.001;
    allocationStatus = {
      isValid: isMatched,
      text: isMatched
        ? `Allocated: ₹${exactSum.toFixed(2)} (Matches total)`
        : `Allocated: ₹${exactSum.toFixed(2)} / ₹${totalAmountNum.toFixed(2)} (${diff > 0 ? `₹${diff.toFixed(2)} remaining` : `₹${Math.abs(diff).toFixed(2)} over`})`,
    };
  } else if (splitType === 'percentage') {
    const pctSum = Array.from(selectedUserIds).reduce((acc, uid) => {
      const v = parseFloat(rawValues[uid]) || 0;
      return acc + v;
    }, 0);
    const diff = Math.round((100 - pctSum) * 100) / 100;
    const isMatched = Math.abs(diff) < 0.001;
    allocationStatus = {
      isValid: isMatched,
      text: isMatched
        ? `Total: 100% (Matches 100%)`
        : `Total: ${pctSum}% / 100% (${diff > 0 ? `${diff}% remaining` : `${Math.abs(diff)}% over`})`,
    };
  } else if (splitType === 'shares') {
    const totalShares = Array.from(selectedUserIds).reduce((acc, uid) => {
      const v = parseFloat(rawValues[uid]) || 1;
      return acc + (v > 0 ? v : 1);
    }, 0);
    allocationStatus = {
      isValid: totalShares > 0,
      text: `Total weight: ${totalShares} share${totalShares === 1 ? '' : 's'}`,
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please enter an expense description');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    if (!groupId) {
      setError('Please select a group');
      return;
    }
    if (!paidBy) {
      setError('Please select who paid the expense');
      return;
    }
    if (selectedUserIds.size === 0) {
      setError('Please select at least one participant');
      return;
    }

    const participants = [];
    const amountCents = Math.round(Number(amount) * 100);

    if (splitType === 'equal') {
      selectedUserIds.forEach((uid) => {
        participants.push({ userId: Number(uid) });
      });
    } else if (splitType === 'exact') {
      let sumCents = 0;
      for (const uid of selectedUserIds) {
        const val = rawValues[uid];
        const num = parseFloat(val);
        if (Number.isNaN(num) || num <= 0) {
          setError('Each participant must have an exact amount greater than ₹0');
          return;
        }
        const cents = Math.round(num * 100);
        sumCents += cents;
        participants.push({
          userId: Number(uid),
          rawValue: num,
        });
      }
      if (sumCents !== amountCents) {
        setError(
          `Exact amounts sum to ₹${(sumCents / 100).toFixed(2)}, which does not match total ₹${(amountCents / 100).toFixed(2)}`
        );
        return;
      }
    } else if (splitType === 'percentage') {
      let sumPct = 0;
      for (const uid of selectedUserIds) {
        const val = rawValues[uid];
        const num = parseFloat(val);
        if (Number.isNaN(num) || num <= 0 || num > 100) {
          setError('Each participant must have a percentage between 0 and 100');
          return;
        }
        sumPct += num;
        participants.push({
          userId: Number(uid),
          rawValue: num,
        });
      }
      if (Math.abs(sumPct - 100) > 0.001) {
        setError(`Percentages must sum to exactly 100% (currently ${sumPct}%)`);
        return;
      }
    } else if (splitType === 'shares') {
      for (const uid of selectedUserIds) {
        const val = rawValues[uid];
        const num = val === '' || val === undefined ? 1 : parseFloat(val);
        if (Number.isNaN(num) || num <= 0) {
          setError('Share weight must be a positive number');
          return;
        }
        participants.push({
          userId: Number(uid),
          rawValue: num,
        });
      }
    }

    setLoading(true);
    try {
      if (onAddExpenseSuccess) {
        await onAddExpenseSuccess({
          description: description.trim(),
          amount: parseFloat(amount).toFixed(2),
          groupId: Number(groupId),
          paidBy: Number(paidBy),
          splitType,
          participants,
        });
      }
      onClose();
      setDescription('');
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save expense');
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
          <button type="button" style={styles.closeBtn} onClick={onClose}>
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
                step="0.01"
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
                disabled={groups.length === 0}
              >
                {groups.length > 0 ? (
                  groups.map((g) => (
                    <option key={g.id} value={g.id} style={styles.option}>
                      {g.name}
                    </option>
                  ))
                ) : (
                  <option value="" style={styles.option}>
                    No groups available
                  </option>
                )}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              style={styles.select}
              disabled={members.length === 0}
            >
              {members.length > 0 ? (
                members.map((m) => (
                  <option key={m.id} value={m.id} style={styles.option}>
                    {m.name} {m.id === currentUserId ? '(You)' : ''}
                  </option>
                ))
              ) : (
                <option value="" style={styles.option}>
                  {loadingMembers ? 'Loading members...' : 'No members'}
                </option>
              )}
            </select>
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

          {/* Participants & Split Breakdown Section */}
          <div style={styles.participantsSection}>
            <div style={styles.participantsHeader}>
              <span style={styles.participantsTitle}>Participants</span>
              {allocationStatus && (
                <span
                  style={{
                    ...styles.statusBadge,
                    color: allocationStatus.isValid ? '#10B981' : '#F43F5E',
                    backgroundColor: allocationStatus.isValid
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(244, 63, 94, 0.1)',
                  }}
                >
                  {allocationStatus.text}
                </span>
              )}
            </div>

            {loadingMembers ? (
              <div style={styles.emptyNote}>Loading members...</div>
            ) : members.length === 0 ? (
              <div style={styles.emptyNote}>No members found in this group</div>
            ) : (
              <div style={styles.memberList}>
                {members.map((m) => {
                  const isChecked = selectedUserIds.has(m.id);
                  return (
                    <div
                      key={m.id}
                      style={{
                        ...styles.memberRow,
                        opacity: isChecked ? 1 : 0.45,
                      }}
                    >
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleParticipant(m.id)}
                          style={styles.checkbox}
                        />
                        <span style={styles.memberName}>
                          {m.name} {m.id === currentUserId ? '(You)' : ''}
                        </span>
                      </label>

                      {isChecked && splitType !== 'equal' && (
                        <div style={styles.splitInputContainer}>
                          <input
                            type="number"
                            step={splitType === 'exact' ? '0.01' : '1'}
                            min="0"
                            placeholder={
                              splitType === 'exact'
                                ? '₹ Amount'
                                : splitType === 'percentage'
                                ? '%'
                                : 'Weight (e.g. 1)'
                            }
                            value={rawValues[m.id] !== undefined ? rawValues[m.id] : ''}
                            onChange={(e) => handleRawValueChange(m.id, e.target.value)}
                            style={styles.splitInput}
                            required
                          />
                          <span style={styles.splitInputUnit}>
                            {splitType === 'exact' ? '₹' : splitType === 'percentage' ? '%' : 'shares'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              disabled={loading}
            >
              {loading ? (
                'Saving...'
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
    width: '500px',
    maxWidth: '94vw',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  participantsSection: {
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  participantsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  participantsTitle: {
    color: '#8E9CAE',
    fontSize: '12.5px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  statusBadge: {
    fontSize: '11.5px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  emptyNote: {
    color: '#717D96',
    fontSize: '12.5px',
    textAlign: 'center',
    padding: '10px 0',
  },
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 4px',
    borderRadius: '8px',
    gap: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    flex: 1,
    color: '#FFFFFF',
    fontSize: '13.5px',
  },
  checkbox: {
    accentColor: '#7C3AED',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  memberName: {
    fontWeight: '500',
  },
  splitInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  splitInput: {
    width: '85px',
    backgroundColor: '#0F1528',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    padding: '6px 8px',
    color: '#FFFFFF',
    fontSize: '13px',
    outline: 'none',
    textAlign: 'right',
  },
  splitInputUnit: {
    color: '#8E9CAE',
    fontSize: '12px',
    minWidth: '24px',
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
