import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function AddMemberModal({ isOpen, onClose, onAdd, groupName }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter the member email');
      return;
    }

    setLoading(true);
    try {
      await onAdd(email.trim());
      setEmail('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.modalTitle}>Add Member{groupName ? ` to ${groupName}` : ''}</h2>
          <button type="button" style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#8E9CAE" />
          </button>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Member email</label>
            <input
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoFocus
            />
          </div>
          <p style={styles.hint}>They must already have a Splitly account.</p>

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
                  <span>Add Member</span>
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
    gap: '12px',
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
  },
  hint: {
    color: '#717D96',
    fontSize: '12px',
    margin: 0,
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
