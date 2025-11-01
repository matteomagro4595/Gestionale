import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI } from '../../services/api';
import ExpensesAssistant from '../../components/ExpensesAssistant';
import { PlusIcon, BarChartIcon, XIcon, CheckIcon, UsersIcon } from '../../components/Icons';
import './Dashboard.css';

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
    <div className="expenses-dashboard-container">
      <div className="expenses-header">
        <h1>Gestione Spese</h1>
        <div className="expenses-header-actions">
          <Link to="/expenses/summary" className="btn btn-secondary">
            <span><BarChartIcon size={20} /></span>
            <span className="btn-text" style={{ marginLeft: '0.25rem' }}>Riepilogo Generale</span>
          </Link>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <span className="btn-icon"><PlusIcon size={20} /></span>
            <span className="btn-text">Nuovo Gruppo</span>
          </button>
        </div>
      </div>

      {/* Filters and Sort Section */}
      <div className="expenses-filters-card">
        <div className="expenses-filters-content">
          {/* Filters - Left side */}
          <div className="expenses-filters-left">
            <div className="expenses-filters-inputs">
              <div className="form-group expenses-filter-group">
                <label>Cerca gruppo</label>
                <input
                  type="text"
                  placeholder="Nome o descrizione..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-group expenses-filter-group-small">
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
              <div className="expenses-filters-status">
                <span className="expenses-filters-count">
                  {filteredAndSortedGroups.length} di {groups.length} gruppi
                </span>
                <button
                  className="btn btn-secondary expenses-filters-clear"
                  onClick={() => {
                    setSearchTerm('');
                    setMinMembers('');
                  }}
                >
                  <span className="btn-icon"><XIcon size={16} /></span>
                  <span className="btn-text">Cancella</span>
                </button>
              </div>
            )}
          </div>

          {/* Sort - Right side */}
          <div className="expenses-filters-right">
            <div className="form-group">
              <label>Ordina</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedGroups.length === 0 ? (
        <div className="expenses-empty-state">
          <div className="expenses-empty-icon">
            <UsersIcon size={64} />
          </div>
          <h3>{groups.length === 0 ? 'Nessun gruppo trovato' : 'Nessun gruppo corrisponde ai filtri'}</h3>
          <p>{groups.length === 0 ? 'Crea il primo gruppo per iniziare a gestire le tue spese!' : 'Prova a modificare i filtri di ricerca.'}</p>
        </div>
      ) : (
        <div className="expenses-groups-grid">
          {filteredAndSortedGroups.map((group) => (
            <Link key={group.id} to={`/expenses/groups/${group.id}`} className="expenses-group-card">
              <h2>{group.nome}</h2>
              <p className="expenses-group-description">{group.descrizione || 'Nessuna descrizione'}</p>
              <div className="expenses-group-stats">
                <div className="expenses-group-stat">
                  <span className="expenses-group-stat-icon">
                    <UsersIcon size={18} />
                  </span>
                  <span>{group.members?.length || 0} membri</span>
                </div>
                <div className="expenses-group-stat">
                  <span className="expenses-group-stat-icon">
                    <BarChartIcon size={18} />
                  </span>
                  <span>{group.expenses?.length || 0} spese</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="expenses-modal-overlay">
          <div className="expenses-modal-card">
            <h2>Nuovo Gruppo</h2>
            <form onSubmit={handleCreateGroup} className="expenses-modal-form">
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
              <div className="expenses-modal-actions">
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

      <ExpensesAssistant />
    </div>
  );
};

export default Dashboard;
