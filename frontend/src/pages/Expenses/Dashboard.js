import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI } from '../../services/api';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ nome: '', descrizione: '' });

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

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <h1>Gestione Spese</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nuovo Gruppo
        </button>
      </div>

      <div className="grid" style={{ marginTop: '2rem' }}>
        {groups.map((group) => (
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
