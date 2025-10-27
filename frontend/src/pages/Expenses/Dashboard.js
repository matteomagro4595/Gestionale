import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI } from '../../services/api';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ nome: '', descrizione: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [minMembers, setMinMembers] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await expensesAPI.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await expensesAPI.createGroup(newGroup);
      setNewGroup({ nome: '', descrizione: '' });
      setShowModal(false);
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Filter and sort groups
  const filteredAndSortedGroups = groups
    .filter(group => {
      // Filter by search term
      const matchesSearch = group.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (group.descrizione && group.descrizione.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by minimum members
      const matchesMembers = minMembers === '' || (group.members?.length || 0) >= parseInt(minMembers);

      return matchesSearch && matchesMembers;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.nome.localeCompare(b.nome);
      } else {
        return b.nome.localeCompare(a.nome);
      }
    });

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Gestione Spese</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/expenses/summary" className="btn btn-secondary">
            📊 Riepilogo Generale
          </Link>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Nuovo Gruppo
          </button>
        </div>
      </div>

      {/* Filters and Sort Section */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Filters - Left side */}
          <div style={{ flex: '1 1 auto', minWidth: '280px' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                <label>Cerca gruppo</label>
                <input
                  type="text"
                  placeholder="Nome o descrizione..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: '0 1 150px' }}>
                <label>Min. membri</label>
                <input
                  type="number"
                  placeholder="es. 2"
                  min="1"
                  value={minMembers}
                  onChange={(e) => setMinMembers(e.target.value)}
                />
              </div>
            </div>
            {(searchTerm || minMembers) && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {filteredAndSortedGroups.length} di {groups.length} gruppi
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setMinMembers('');
                  }}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                >
                  Cancella
                </button>
              </div>
            )}
          </div>

          {/* Sort - Right side */}
          <div style={{ flex: '0 0 auto', minWidth: '180px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.9rem' }}>Ordina</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedGroups.length === 0 ? (
        <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
            {groups.length === 0 ? 'Nessun gruppo trovato. Crea il primo!' : 'Nessun gruppo corrisponde ai filtri.'}
          </p>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: '1rem' }}>
          {filteredAndSortedGroups.map((group) => (
          <Link key={group.id} to={`/expenses/groups/${group.id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              <h2>{group.nome}</h2>
              <p style={{ color: '#7f8c8d' }}>{group.descrizione || 'Nessuna descrizione'}</p>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
                {group.members?.length || 0} membri • {group.expenses?.length || 0} spese
              </p>
            </div>
          </Link>
        ))}
        </div>
      )}

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
            <h2>Nuovo Gruppo</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newGroup.nome}
                  onChange={(e) => setNewGroup({ ...newGroup, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrizione</label>
                <textarea
                  value={newGroup.descrizione}
                  onChange={(e) => setNewGroup({ ...newGroup, descrizione: e.target.value })}
                  rows="3"
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
    </div>
  );
};

export default Dashboard;
