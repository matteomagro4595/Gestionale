import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shoppingAPI, authAPI } from '../../services/api';

const ShoppingListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ nome: '', quantita: '', note: '' });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadList();
    loadCurrentUser();
  }, [listId]);

  const loadCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadList = async () => {
    try {
      const response = await shoppingAPI.getList(listId);
      setList(response.data);
    } catch (error) {
      console.error('Error loading list:', error);

      // Check if list was deleted or doesn't exist
      if (error.response && (error.response.status === 404 || error.response.status === 403)) {
        alert('Questa lista della spesa non esiste più o è stata eliminata.');
        navigate('/shopping');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await shoppingAPI.createItem(listId, newItem);
      setNewItem({ nome: '', quantita: '', note: '' });
      setShowModal(false);
      loadList();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleToggleItem = async (itemId, completed) => {
    try {
      await shoppingAPI.updateItem(listId, itemId, { completato: !completed });
      loadList();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo articolo?')) {
      try {
        await shoppingAPI.deleteItem(listId, itemId);
        loadList();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const copyShareToken = () => {
    navigator.clipboard.writeText(list.share_token);
    alert('Token copiato negli appunti!');
  };

  const shareViaWhatsApp = () => {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/shopping/join/${list.share_token}`;
    const message = `Ciao! Ti invito a collaborare alla lista della spesa "${list.nome}".

Clicca sul link per accedere: ${shareUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyShareLink = () => {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/shopping/join/${list.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copiato negli appunti!');
  };

  const handleDeleteList = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questa lista? Questa azione non può essere annullata.')) {
      try {
        await shoppingAPI.deleteList(listId);
        navigate('/shopping');
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Errore durante l\'eliminazione della lista');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <button
        onClick={() => navigate('/shopping')}
        className="btn btn-secondary"
        style={{ marginTop: '1rem' }}
      >
        ← Indietro
      </button>

      <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>{list?.nome}</h1>
          {currentUser && list && currentUser.id === list.owner_id && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteList}
              style={{ marginLeft: '1rem' }}
            >
              Elimina Lista
            </button>
          )}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={copyShareToken}>
              Copia Token
            </button>
            <button className="btn btn-secondary" onClick={copyShareLink}>
              Copia Link
            </button>
            <button
              className="btn btn-primary"
              onClick={shareViaWhatsApp}
              style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
            >
              📱 Condividi su WhatsApp
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
            Token: {list?.share_token}
          </p>
        </div>

        {/* Members section */}
        {list && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: '#2c3e50' }}>
              Membri della lista
            </h3>

            {/* Owner */}
            {list.owner && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#fff',
                borderRadius: '6px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#3498db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  marginRight: '0.75rem'
                }}>
                  {list.owner.nome.charAt(0)}{list.owner.cognome.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                    {list.owner.nome} {list.owner.cognome}
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#3498db',
                      fontWeight: 'bold'
                    }}>
                      (Proprietario)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                    {list.owner.email}
                  </div>
                </div>
              </div>
            )}

            {/* Shared users */}
            {list.shared_users && list.shared_users.length > 0 && (
              <>
                {list.shared_users.map((user) => (
                  <div key={user.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#fff',
                    borderRadius: '6px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
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
                  </div>
                ))}
              </>
            )}

            {/* No shared users message */}
            {(!list.shared_users || list.shared_users.length === 0) && (
              <div style={{
                fontSize: '0.9rem',
                color: '#7f8c8d',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '0.5rem'
              }}>
                Nessun altro membro. Condividi la lista per collaborare!
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Articoli</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Nuovo Articolo
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {list?.items?.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={item.completato}
                  onChange={() => handleToggleItem(item.id, item.completato)}
                  style={{ marginRight: '1rem', width: '20px', height: '20px' }}
                />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      textDecoration: item.completato ? 'line-through' : 'none',
                      color: item.completato ? '#7f8c8d' : '#2c3e50',
                      margin: 0,
                    }}
                  >
                    {item.nome}
                  </h3>
                  {item.quantita && (
                    <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      Quantità: {item.quantita}
                    </p>
                  )}
                  {item.note && (
                    <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      Note: {item.note}
                    </p>
                  )}
                </div>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteItem(item.id)}
                style={{ marginLeft: '1rem' }}
              >
                Elimina
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Item Modal */}
      {showModal && (
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
            <h2>Nuovo Articolo</h2>
            <form onSubmit={handleCreateItem}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newItem.nome}
                  onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantità</label>
                <input
                  type="text"
                  value={newItem.quantita}
                  onChange={(e) => setNewItem({ ...newItem, quantita: e.target.value })}
                  placeholder="es. 2 kg, 1 confezione..."
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={newItem.note}
                  onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                  rows="3"
                  placeholder="Note aggiuntive..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Aggiungi</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

export default ShoppingListDetail;
