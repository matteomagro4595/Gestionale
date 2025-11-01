import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shoppingAPI } from '../../services/api';
import ShoppingAssistant from '../../components/ShoppingAssistant';
import { PlusIcon, KeyIcon, CheckIcon, XIcon, ShoppingBagIcon } from '../../components/Icons';
import './ShoppingLists.css';

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
    <div className="shopping-lists-container">
      <div className="shopping-lists-header">
        <h1>Liste della Spesa</h1>
        <div className="shopping-lists-actions">
          <button className="btn btn-secondary" onClick={() => setShowShareModal(true)}>
            <span className="btn-icon"><KeyIcon size={20} /></span>
            <span className="btn-text">Accedi con Token</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <span className="btn-icon"><PlusIcon size={20} /></span>
            <span className="btn-text">Nuova Lista</span>
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="shopping-lists-empty">
          <div className="shopping-lists-empty-icon">
            <ShoppingBagIcon size={64} />
          </div>
          <h3>Nessuna lista trovata</h3>
          <p>Crea la tua prima lista della spesa per iniziare!</p>
        </div>
      ) : (
        <div className="shopping-lists-grid">
          {lists.map((list) => (
            <Link key={list.id} to={`/shopping/${list.id}`} className="shopping-list-card">
              <h2>{list.nome}</h2>
              <div className="shopping-list-info">
                <div className="shopping-list-stat">
                  <span className="shopping-list-stat-icon">
                    <ShoppingBagIcon size={18} />
                  </span>
                  <span>{list.items?.length || 0} articoli</span>
                </div>
              </div>
              <div className="shopping-list-token">
                <div className="shopping-list-token-label">Token</div>
                <div className="shopping-list-token-value">
                  {list.share_token?.substring(0, 10)}...
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="shopping-modal-overlay">
          <div className="shopping-modal-card">
            <h2>Nuova Lista</h2>
            <form onSubmit={handleCreateList} className="shopping-modal-form">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newList.nome}
                  onChange={(e) => setNewList({ nome: e.target.value })}
                  required
                />
              </div>
              <div className="shopping-modal-actions">
                <button type="submit" className="btn btn-primary">
                  <span className="btn-icon"><CheckIcon size={20} /></span>
                  <span className="btn-text">Crea</span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <span className="btn-icon"><XIcon size={20} /></span>
                  <span className="btn-text">Annulla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="shopping-modal-overlay">
          <div className="shopping-modal-card">
            <h2>Accedi con Token</h2>
            <form onSubmit={handleAccessSharedList} className="shopping-modal-form">
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
              <div className="shopping-modal-actions">
                <button type="submit" className="btn btn-primary">
                  <span className="btn-icon"><CheckIcon size={20} /></span>
                  <span className="btn-text">Accedi</span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                  <span className="btn-icon"><XIcon size={20} /></span>
                  <span className="btn-text">Annulla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ShoppingAssistant />
    </div>
  );
};

export default ShoppingLists;
