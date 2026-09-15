import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../api/api';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.signup({ name, email, password });
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      setErrorMessage(`${msg} (You can also click "Continue as Demo User" below)`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignup = () => {
    localStorage.setItem('token', 'demo-jwt-token-12345');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: name || 'Sohan', email: email || 'sohan@example.com' }));
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      {/* Background ambient glow */}
      <div style={styles.glowCircle1} />
      <div style={styles.glowCircle2} />

      <div style={styles.card}>
        {/* Brand Header */}
        <div style={styles.brandRow}>
          <div style={styles.logoBadge}>
            <CreditCard size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <div style={styles.brandTitle}>Splitly</div>
            <div style={styles.brandSubtitle}>Expense Manager</div>
          </div>
        </div>

        <div style={styles.titleSection}>
          <h1 style={styles.heading}>Create an account</h1>
          <p style={styles.subtext}>Join Splitly and split expenses effortlessly with friends</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} color="#F87171" style={{ flexShrink: 0 }} />
            <span style={styles.errorText}>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div style={styles.successBox}>
            <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0 }} />
            <span style={styles.successText}>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="#6B7280" style={styles.inputIcon} />
              <input
                type="text"
                placeholder="e.g. Sohan Poojary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} color="#6B7280" style={styles.inputIcon} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password (min 8 characters)</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#6B7280" style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#8E9CAE" />
                ) : (
                  <Eye size={18} color="#8E9CAE" />
                )}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#6B7280" style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.rememberRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={styles.checkbox}
              />
              <span>I agree to the Terms of Service & Privacy Policy</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Demo signup bypass */}
        <button
          type="button"
          onClick={handleDemoSignup}
          style={styles.demoBtn}
        >
          <span>Continue as Demo User</span>
        </button>

        {/* Switch to Login */}
        <div style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.loginLink}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#080B14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  glowCircle1: {
    position: 'absolute',
    top: '8%',
    right: '20%',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0) 70%)',
    pointerEvents: 'none',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: '8%',
    left: '20%',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#0F1528',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '36px 32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(124, 58, 237, 0.08)',
    position: 'relative',
    zIndex: 1,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '26px',
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.45)',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
  },
  brandSubtitle: {
    color: '#717D96',
    fontSize: '12px',
    fontWeight: '500',
  },
  titleSection: {
    marginBottom: '22px',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px',
  },
  subtext: {
    color: '#8E9CAE',
    fontSize: '14px',
    margin: 0,
    lineHeight: 1.5,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
  },
  successText: {
    color: '#6EE7B7',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    color: '#D1D5DB',
    fontSize: '13px',
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    backgroundColor: '#0A0D18',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '12px 42px 12px 42px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  rememberRow: {
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: '2px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    color: '#8E9CAE',
    fontSize: '12.5px',
    lineHeight: 1.4,
    cursor: 'pointer',
  },
  checkbox: {
    accentColor: '#7C3AED',
    width: '15px',
    height: '15px',
    marginTop: '2px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px 20px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
    color: '#FFFFFF',
    fontSize: '14.5px',
    fontWeight: '600',
    border: 'none',
    marginTop: '6px',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
    transition: 'all 0.2s ease',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '18px 0 14px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  demoBtn: {
    width: '100%',
    padding: '11px 16px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#D1D5DB',
    fontSize: '13.5px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  footerText: {
    marginTop: '22px',
    textAlign: 'center',
    color: '#8E9CAE',
    fontSize: '13.5px',
  },
  loginLink: {
    color: '#A855F7',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '4px',
  },
};