import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shoppingAPI } from '../../services/api';

const ShoppingLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newList, setNewList] = useState({ nome: '' });
  const [shareToken, setShareToken] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const response = await shoppingAPI.getLists();
      setLists(response.data);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      await shoppingAPI.createList(newList);
      setNewList({ nome: '' });
      setShowModal(false);
      loadLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleAccessSharedList = async (e) => {
    e.preventDefault();
    try {
      const response = await shoppingAPI.getListByToken(shareToken);
      setShareToken('');
      setShowShareModal(false);
      loadLists();
      // Navigate to the list
      window.location.href = `/shopping/${response.data.id}`;
    } catch (error) {
      console.error('Error accessing shared list:', error);
      alert('Lista non trovata o token non valido');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <h1>Liste della Spesa</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowShareModal(true)}>
            Accedi con Token
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Nuova Lista
          </button>
        </div>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        {lists.map((list) => (
          <Link key={list.id} to={`/shopping/${list.id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              <h2>{list.nome}</h2>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
                {list.items?.length || 0} articoli
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#7f8c8d' }}>
                Token: {list.share_token?.substring(0, 10)}...
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Modal */}
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
            <h2>Nuova Lista</h2>
            <form onSubmit={handleCreateList}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newList.nome}
                  onChange={(e) => setNewList({ nome: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Crea</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
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
            <h2>Accedi con Token</h2>
            <form onSubmit={handleAccessSharedList}>
              <div className="form-group">
                <label>Token di Condivisione</label>
                <input
                  type="text"
                  value={shareToken}
                  onChange={(e) => setShareToken(e.target.value)}
                  placeholder="Inserisci il token..."
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Accedi</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
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

export default ShoppingLists;
