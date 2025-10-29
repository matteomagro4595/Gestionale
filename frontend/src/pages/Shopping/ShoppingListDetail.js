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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadList();
    loadCurrentUser();
  }, [listId]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest('.form-group')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

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

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNewItem({ ...newItem, nome: value });

    // Filter existing items that match the input
    if (value.trim().length > 0) {
      const filtered = list?.items?.filter(item =>
        item.nome.toLowerCase().includes(value.toLowerCase().trim())
      ) || [];
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (item) => {
    if (item.completato) {
      // If item is completed, unflag it
      try {
        await shoppingAPI.updateItem(listId, item.id, { completato: false });
        setNewItem({ nome: '', quantita: '', note: '' });
        setShowModal(false);
        setSuggestions([]);
        setShowSuggestions(false);
        loadList();
      } catch (error) {
        console.error('Error updating item:', error);
      }
    } else {
      // Item is already in the list and not completed
      alert(`L'articolo "${item.nome}" è già presente nella lista da acquistare.`);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();

    // Check if item already exists (case-insensitive exact match)
    const existingItem = list?.items?.find(
      item => item.nome.toLowerCase().trim() === newItem.nome.toLowerCase().trim()
    );

    if (existingItem) {
      if (existingItem.completato) {
        // Unflag it
        await shoppingAPI.updateItem(listId, existingItem.id, { completato: false });
      } else {
        alert(`L'articolo "${existingItem.nome}" è già presente nella lista.`);
        return;
      }
    } else {
      // Create new item
      try {
        await shoppingAPI.createItem(listId, newItem);
      } catch (error) {
        console.error('Error creating item:', error);
        return;
      }
    }

    setNewItem({ nome: '', quantita: '', note: '' });
    setSuggestions([]);
    setShowSuggestions(false);
    setShowModal(false);
    loadList();
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

  // Sort items: unchecked first (alphabetically), then checked (alphabetically)
  const getSortedItems = () => {
    if (!list?.items) return [];

    return [...list.items].sort((a, b) => {
      // First sort by completion status (unchecked items first)
      if (a.completato !== b.completato) {
        return a.completato ? 1 : -1;
      }

      // Then sort alphabetically by name (case-insensitive)
      return a.nome.toLowerCase().localeCompare(b.nome.toLowerCase());
    });
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
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h1 style={{
            margin: 0,
            flex: '1 1 auto',
            minWidth: '200px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {list?.nome}
          </h1>
          {currentUser && list && currentUser.id === list.owner_id && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteList}
              style={{ flexShrink: 0 }}
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
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ fontSize: '0.85rem', color: '#7f8c8d', margin: '0 0 0.25rem 0' }}>
              Token:
            </p>
            <div style={{
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: '#2c3e50',
              padding: '0.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '3px',
              border: '1px solid #dee2e6'
            }}>
              {list?.share_token}
            </div>
          </div>
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
          {getSortedItems().map((item) => (
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
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Nome</label>
                <input
                  type="text"
                  value={newItem.nome}
                  onChange={handleNameChange}
                  onFocus={() => {
                    if (newItem.nome.trim().length > 0 && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  required
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1001,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginTop: '4px'
                  }}>
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSuggestionClick(item)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: item.completato ? '#f0f9ff' : '#fff5f5'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = item.completato ? '#dbeafe' : '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = item.completato ? '#f0f9ff' : '#fff5f5'}
                      >
                        <span style={{
                          flex: 1,
                          textDecoration: item.completato ? 'line-through' : 'none',
                          color: item.completato ? '#6b7280' : '#991b1b'
                        }}>
                          {item.nome}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          backgroundColor: item.completato ? '#3b82f6' : '#ef4444',
                          color: 'white',
                          fontWeight: '600'
                        }}>
                          {item.completato ? '✓ Completato' : '⚠ Già presente'}
                        </span>
                      </div>
                    ))}
                    <div style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      Clicca su un articolo completato per rimetterlo nella lista
                    </div>
                  </div>
                )}
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
