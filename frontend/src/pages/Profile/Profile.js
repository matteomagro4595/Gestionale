import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user: contextUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email update state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ email: '', password: '' });
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Password update state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await authAPI.updateEmail(emailData);
      setUser(response.data);
      setEmailSuccess('Email aggiornata con successo! Verrai reindirizzato al login...');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      setEmailError(error.response?.data?.detail || 'Errore durante l\'aggiornamento dell\'email');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Le password non corrispondono');
      return;
    }

    // Validate password length
    if (passwordData.new_password.length < 6) {
      setPasswordError('La password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      await authAPI.updatePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordSuccess('Password aggiornata con successo!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.detail || 'Errore durante l\'aggiornamento della password');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="profile-container">
      <div className="profile-content">
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{ marginBottom: '1rem' }}
        >
          ← Indietro
        </button>

        <h1>Profilo Utente</h1>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.nome?.charAt(0)}{user?.cognome?.charAt(0)}
            </div>
            <div>
              <h2>{user?.nome} {user?.cognome}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          <div className="profile-info">
            <h3>Informazioni Account</h3>
            <div className="info-row">
              <span className="info-label">Nome:</span>
              <span className="info-value">{user?.nome}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cognome:</span>
              <span className="info-value">{user?.cognome}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Registrato il:</span>
              <span className="info-value">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : '-'}
              </span>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEmailData({ email: user?.email || '', password: '' });
                setShowEmailModal(true);
              }}
            >
              Modifica Email
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                setShowPasswordModal(true);
              }}
            >
              Cambia Password
            </button>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Modifica Email</h2>
              <form onSubmit={handleUpdateEmail}>
                <div className="form-group">
                  <label>Nuova Email</label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Conferma Password</label>
                  <input
                    type="password"
                    value={emailData.password}
                    onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                    placeholder="Inserisci la tua password attuale"
                    required
                  />
                  <small style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
                    Per sicurezza, conferma la tua password per modificare l'email
                  </small>
                </div>

                {emailError && (
                  <div className="alert alert-error">
                    {emailError}
                  </div>
                )}

                {emailSuccess && (
                  <div className="alert alert-success">
                    {emailSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Salva</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEmailModal(false);
                      setEmailError('');
                      setEmailSuccess('');
                    }}
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Cambia Password</h2>
              <form onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label>Password Attuale</label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nuova Password</label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    placeholder="Minimo 6 caratteri"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Conferma Nuova Password</label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    placeholder="Ripeti la nuova password"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="alert alert-error">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="alert alert-success">
                    {passwordSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Salva</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
