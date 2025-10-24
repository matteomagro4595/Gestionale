import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expensesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newExpense, setNewExpense] = useState({
    descrizione: '',
    importo: '',
    tag: 'Spesa',
    division_type: 'Uguale',
    paid_by_id: '',
    participants: [],
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [groupId]);

  const loadData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes, usersRes] = await Promise.all([
        expensesAPI.getGroup(groupId),
        expensesAPI.getExpenses(groupId),
        expensesAPI.getBalances(groupId),
        usersAPI.getUsers(),
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const participants = group.members.map(member => ({
        user_id: member.user_id,
        importo: null,
        percentuale: null,
      }));

      await expensesAPI.createExpense({
        ...newExpense,
        importo: parseFloat(newExpense.importo),
        paid_by_id: parseInt(newExpense.paid_by_id),
        group_id: parseInt(groupId),
        participants,
      });

      setNewExpense({
        descrizione: '',
        importo: '',
        tag: 'Spesa',
        division_type: 'Uguale',
        paid_by_id: '',
        participants: [],
      });
      setShowExpenseModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Errore durante la creazione della spesa');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert('Seleziona un utente');
      return;
    }

    try {
      await expensesAPI.addMember(groupId, { user_id: parseInt(selectedUserId) });
      setSelectedUserId('');
      setShowMemberModal(false);
      loadData();
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.detail || 'Errore durante l\'aggiunta del membro');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo membro dal gruppo?')) {
      try {
        await expensesAPI.removeMember(groupId, userId);
        loadData();
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Errore durante la rimozione del membro');
      }
    }
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  const getAvailableUsers = () => {
    const memberIds = group?.members?.map(m => m.user_id) || [];
    return users.filter(u => !memberIds.includes(u.id));
  };

  const isCreator = group?.creator_id === currentUser?.id;

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <button
        onClick={() => navigate('/expenses')}
        className="btn btn-secondary"
        style={{ marginTop: '1rem' }}
      >
        ← Indietro
      </button>

      <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <h1>{group?.nome}</h1>
        <p style={{ color: '#7f8c8d' }}>{group?.descrizione}</p>
      </div>

      {/* Members Section */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Membri del Gruppo</h2>
          <button className="btn btn-success" onClick={() => setShowMemberModal(true)}>
            Aggiungi Membro
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {group?.members?.map((member) => {
            const user = getUserById(member.user_id);
            return (
              <div
                key={member.id}
                style={{
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                    }}
                  >
                    {user?.nome?.charAt(0)}{user?.cognome?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {user?.nome} {user?.cognome}
                      {member.user_id === group.creator_id && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#f39c12' }}>
                          👑 Creatore
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                {isCreator && member.user_id !== group.creator_id && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveMember(member.user_id)}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    Rimuovi
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Balances */}
      <div className="card">
        <h2>Bilanci</h2>
        <table>
          <thead>
            <tr>
              <th>Utente</th>
              <th>Totale Pagato</th>
              <th>Totale Dovuto</th>
              <th>Bilancio</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance) => (
              <tr key={balance.user_id}>
                <td>{balance.user_name}</td>
                <td>€{balance.total_paid.toFixed(2)}</td>
                <td>€{balance.total_owed.toFixed(2)}</td>
                <td style={{ color: balance.balance >= 0 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                  {balance.balance >= 0 ? '+' : ''}€{balance.balance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expenses */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Spese</h2>
          <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
            Nuova Spesa
          </button>
        </div>
        {expenses.length === 0 ? (
          <p style={{ marginTop: '1rem', color: '#7f8c8d', textAlign: 'center' }}>
            Nessuna spesa registrata. Aggiungi la prima spesa!
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descrizione</th>
                <th>Importo</th>
                <th>Tag</th>
                <th>Pagato da</th>
                <th>Divisione</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const paidByUser = getUserById(expense.paid_by_id);
                return (
                  <tr key={expense.id}>
                    <td>{expense.descrizione || '-'}</td>
                    <td style={{ fontWeight: '600' }}>€{expense.importo.toFixed(2)}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          background: '#ecf0f1',
                          color: '#2c3e50',
                        }}
                      >
                        {expense.tag}
                      </span>
                    </td>
                    <td>{paidByUser?.nome} {paidByUser?.cognome}</td>
                    <td>{expense.division_type}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Member Modal */}
      {showMemberModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2>Aggiungi Membro al Gruppo</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Seleziona Utente</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Seleziona un utente...</option>
                  {getAvailableUsers().map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nome} {user.cognome} ({user.email})
                    </option>
                  ))}
                </select>
                {getAvailableUsers().length === 0 && (
                  <p style={{ marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
                    Tutti gli utenti sono già membri del gruppo
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-success" disabled={!selectedUserId}>
                  Aggiungi
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowMemberModal(false);
                  setSelectedUserId('');
                }}>
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2>Nuova Spesa</h2>
            <form onSubmit={handleCreateExpense}>
              <div className="form-group">
                <label>Descrizione</label>
                <input
                  type="text"
                  value={newExpense.descrizione}
                  onChange={(e) => setNewExpense({ ...newExpense, descrizione: e.target.value })}
                  placeholder="es. Cena al ristorante"
                />
              </div>
              <div className="form-group">
                <label>Importo *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.importo}
                  onChange={(e) => setNewExpense({ ...newExpense, importo: e.target.value })}
                  placeholder="es. 50.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tag</label>
                <select
                  value={newExpense.tag}
                  onChange={(e) => setNewExpense({ ...newExpense, tag: e.target.value })}
                >
                  <option value="Bolletta">Bolletta</option>
                  <option value="Spesa">Spesa</option>
                  <option value="Pranzo/Cena">Pranzo/Cena</option>
                  <option value="Cani">Cani</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pagato da *</label>
                <select
                  value={newExpense.paid_by_id}
                  onChange={(e) => setNewExpense({ ...newExpense, paid_by_id: e.target.value })}
                  required
                >
                  <option value="">Seleziona...</option>
                  {group?.members?.map((member) => {
                    const user = getUserById(member.user_id);
                    return (
                      <option key={member.user_id} value={member.user_id}>
                        {user?.nome} {user?.cognome}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo di divisione</label>
                <select
                  value={newExpense.division_type}
                  onChange={(e) => setNewExpense({ ...newExpense, division_type: e.target.value })}
                >
                  <option value="Uguale">Uguale</option>
                  <option value="Importi esatti">Importi esatti</option>
                  <option value="Percentuale">Percentuale</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Crea</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
