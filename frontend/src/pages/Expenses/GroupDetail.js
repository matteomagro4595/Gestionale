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
  const [editingExpense, setEditingExpense] = useState(null);
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

      // Check if group was deleted or doesn't exist
      if (error.response && (error.response.status === 404 || error.response.status === 403)) {
        alert('Questo gruppo non esiste più o è stato eliminato.');
        navigate('/expenses');
        return;
      }
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

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      await expensesAPI.updateExpense(editingExpense.id, {
        descrizione: editingExpense.descrizione,
        importo: parseFloat(editingExpense.importo),
        tag: editingExpense.tag,
        division_type: editingExpense.division_type,
      });

      setEditingExpense(null);
      loadData();
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Errore durante la modifica della spesa');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense({ ...expense });
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa spesa?')) {
      try {
        await expensesAPI.deleteExpense(expenseId);
        loadData();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Errore durante l\'eliminazione della spesa');
      }
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

  const handleDeleteGroup = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo gruppo? Questa azione eliminerà anche tutte le spese associate e non può essere annullata.')) {
      try {
        await expensesAPI.deleteGroup(groupId);
        navigate('/expenses');
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Errore durante l\'eliminazione del gruppo');
      }
    }
  };

  const copyShareToken = () => {
    navigator.clipboard.writeText(group.share_token);
    alert('Token copiato negli appunti!');
  };

  const shareViaWhatsApp = () => {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/expenses/groups/join/${group.share_token}`;
    const message = `Ciao! Ti invito a unirti al gruppo di spese "${group.nome}".

Clicca sul link per accedere: ${shareUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyShareLink = () => {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/expenses/groups/join/${group.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copiato negli appunti!');
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h1 style={{ margin: 0 }}>{group?.nome}</h1>
          {isCreator && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteGroup}
              style={{ marginLeft: '1rem' }}
            >
              Elimina Gruppo
            </button>
          )}
        </div>
        <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>{group?.descrizione}</p>

        {/* Share Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Condividi Gruppo</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={copyShareToken} style={{ flex: '1 1 auto' }}>
              Copia Token
            </button>
            <button className="btn btn-secondary" onClick={copyShareLink} style={{ flex: '1 1 auto' }}>
              Copia Link
            </button>
            <button
              className="btn btn-primary"
              onClick={shareViaWhatsApp}
              style={{ backgroundColor: '#25D366', borderColor: '#25D366', flex: '1 1 100%' }}
            >
              📱 Condividi su WhatsApp
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#7f8c8d', wordBreak: 'break-all' }}>
            Token: {group?.share_token}
          </p>
        </div>
      </div>

      {/* Members Section */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Membri del Gruppo</h2>

        {/* Creator */}
        {group?.creator && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3498db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              marginRight: '0.75rem'
            }}>
              {group.creator.nome.charAt(0)}{group.creator.cognome.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                {group.creator.nome} {group.creator.cognome}
                <span style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#3498db',
                  fontWeight: 'bold'
                }}>
                  👑 Creatore
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                {group.creator.email}
              </div>
            </div>
          </div>
        )}

        {/* Other Members */}
        {group?.member_users && group.member_users.filter(u => u.id !== group.creator_id).length > 0 && (
          <>
            {group.member_users.filter(u => u.id !== group.creator_id).map((user) => (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#95a5a6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  marginRight: '0.75rem'
                }}>
                  {user.nome.charAt(0)}{user.cognome.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                    {user.nome} {user.cognome}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                    {user.email}
                  </div>
                </div>
                {isCreator && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveMember(user.id)}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    Rimuovi
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* No other members message */}
        {(!group?.member_users || group.member_users.filter(u => u.id !== group.creator_id).length === 0) && (
          <div style={{
            fontSize: '0.9rem',
            color: '#7f8c8d',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            Nessun altro membro. Condividi il gruppo per collaborare!
          </div>
        )}
      </div>

      {/* Balances */}
      <div className="card">
        <h2>Bilanci</h2>
        <div className="table-wrapper">
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
      </div>

      {/* Expenses */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>Spese</h2>
          <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
            Nuova Spesa
          </button>
        </div>
        {expenses.length === 0 ? (
          <p style={{ marginTop: '1rem', color: '#7f8c8d', textAlign: 'center' }}>
            Nessuna spesa registrata. Aggiungi la prima spesa!
          </p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-only table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Descrizione</th>
                    <th>Importo</th>
                    <th>Tag</th>
                    <th>Pagato da</th>
                    <th>Divisione</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => {
                    const paidByUser = getUserById(expense.paid_by_id);
                    const canEdit = expense.paid_by_id === currentUser?.id;
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
                        <td>
                          {canEdit && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleEditExpense(expense)}
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                              >
                                Modifica
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteExpense(expense.id)}
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                              >
                                Elimina
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-only" style={{ marginTop: '1rem' }}>
              {expenses.map((expense) => {
                const paidByUser = getUserById(expense.paid_by_id);
                const canEdit = expense.paid_by_id === currentUser?.id;
                return (
                  <div key={expense.id} className="expense-card-mobile">
                    <div className="expense-card-mobile-header">
                      <div>
                        <div className="expense-card-mobile-title">
                          {expense.descrizione || 'Spesa senza descrizione'}
                        </div>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            background: '#ecf0f1',
                            color: '#2c3e50',
                            display: 'inline-block',
                            marginTop: '0.25rem',
                          }}
                        >
                          {expense.tag}
                        </span>
                      </div>
                      <div className="expense-card-mobile-amount">
                        €{expense.importo.toFixed(2)}
                      </div>
                    </div>
                    <div className="expense-card-mobile-info">
                      <div className="expense-card-mobile-row">
                        <span className="expense-card-mobile-label">Pagato da:</span>
                        <span className="expense-card-mobile-value">
                          {paidByUser?.nome} {paidByUser?.cognome}
                        </span>
                      </div>
                      <div className="expense-card-mobile-row">
                        <span className="expense-card-mobile-label">Divisione:</span>
                        <span className="expense-card-mobile-value">{expense.division_type}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="expense-card-mobile-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEditExpense(expense)}
                        >
                          Modifica
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Elimina
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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

      {/* Edit Expense Modal */}
      {editingExpense && (
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
            <h2>Modifica Spesa</h2>
            <form onSubmit={handleUpdateExpense}>
              <div className="form-group">
                <label>Descrizione</label>
                <input
                  type="text"
                  value={editingExpense.descrizione}
                  onChange={(e) => setEditingExpense({ ...editingExpense, descrizione: e.target.value })}
                  placeholder="es. Cena al ristorante"
                />
              </div>
              <div className="form-group">
                <label>Importo *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingExpense.importo}
                  onChange={(e) => setEditingExpense({ ...editingExpense, importo: e.target.value })}
                  placeholder="es. 50.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tag</label>
                <select
                  value={editingExpense.tag}
                  onChange={(e) => setEditingExpense({ ...editingExpense, tag: e.target.value })}
                >
                  <option value="Bolletta">Bolletta</option>
                  <option value="Spesa">Spesa</option>
                  <option value="Pranzo/Cena">Pranzo/Cena</option>
                  <option value="Cani">Cani</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo di divisione</label>
                <select
                  value={editingExpense.division_type}
                  onChange={(e) => setEditingExpense({ ...editingExpense, division_type: e.target.value })}
                >
                  <option value="Uguale">Uguale</option>
                  <option value="Importi esatti">Importi esatti</option>
                  <option value="Percentuale">Percentuale</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Salva</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingExpense(null)}>
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
