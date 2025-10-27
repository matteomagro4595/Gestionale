import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Summary = () => {
  const { user: currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsRes = await expensesAPI.getGroups();
      const groupsData = groupsRes.data;
      setGroups(groupsData);

      // Load balances for each group
      const balancesData = {};
      for (const group of groupsData) {
        try {
          const balanceRes = await expensesAPI.getBalances(group.id);
          balancesData[group.id] = balanceRes.data;
        } catch (error) {
          console.error(`Error loading balances for group ${group.id}:`, error);
          balancesData[group.id] = [];
        }
      }
      setBalances(balancesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall statistics
  const calculateOverallStats = () => {
    let totalPaid = 0;
    let totalOwed = 0;
    let totalExpenses = 0;

    groups.forEach(group => {
      totalExpenses += group.expenses?.length || 0;

      const groupBalances = balances[group.id] || [];
      const userBalance = groupBalances.find(b => b.user_id === currentUser?.id);

      if (userBalance) {
        totalPaid += userBalance.total_paid;
        totalOwed += userBalance.total_owed;
      }
    });

    const overallBalance = totalPaid - totalOwed;

    return {
      totalGroups: groups.length,
      totalExpenses,
      totalPaid,
      totalOwed,
      overallBalance
    };
  };

  // Calculate who owes who
  const calculateDebtsAndCredits = () => {
    const debts = {}; // { user_name: { amount: X, groups: [...] } }
    const credits = {}; // { user_name: { amount: X, groups: [...] } }

    groups.forEach(group => {
      const groupBalances = balances[group.id] || [];
      const userBalance = groupBalances.find(b => b.user_id === currentUser?.id);

      if (userBalance && userBalance.balance !== 0) {
        // Get other members with opposite balance sign
        groupBalances.forEach(otherBalance => {
          if (otherBalance.user_id !== currentUser?.id) {
            // If I owe money (negative balance) and other has positive balance
            if (userBalance.balance < 0 && otherBalance.balance > 0) {
              const userName = otherBalance.user_name;
              if (!debts[userName]) {
                debts[userName] = { amount: 0, groups: [] };
              }
              // Simplified: my negative balance represents what I owe in this group
              const amountOwed = Math.abs(userBalance.balance);
              debts[userName].amount += amountOwed;
              debts[userName].groups.push({ name: group.nome, amount: amountOwed });
            }
            // If I have credit (positive balance) and other owes (negative balance)
            else if (userBalance.balance > 0 && otherBalance.balance < 0) {
              const userName = otherBalance.user_name;
              if (!credits[userName]) {
                credits[userName] = { amount: 0, groups: [] };
              }
              // Simplified: my positive balance represents what others owe me
              const amountOwedToMe = Math.abs(otherBalance.balance);
              credits[userName].amount += amountOwedToMe;
              credits[userName].groups.push({ name: group.nome, amount: amountOwedToMe });
            }
          }
        });
      }
    });

    return { debts, credits };
  };

  const stats = calculateOverallStats();
  const { debts, credits } = calculateDebtsAndCredits();

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/expenses" style={{ textDecoration: 'none', color: '#3498db', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Torna ai gruppi
          </Link>
          <h1 style={{ margin: 0 }}>Riepilogo Generale</h1>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#3498db' }}>{stats.totalGroups}</h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Gruppi Totali</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#9b59b6' }}>{stats.totalExpenses}</h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Spese Totali</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#2ecc71' }}>€{stats.totalPaid.toFixed(2)}</h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Hai Pagato</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#e67e22' }}>€{stats.totalOwed.toFixed(2)}</h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Devi Pagare</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '2rem',
              margin: '0.5rem 0',
              color: stats.overallBalance >= 0 ? '#2ecc71' : '#e74c3c',
              fontWeight: 'bold'
            }}
          >
            {stats.overallBalance >= 0 ? '+' : ''}€{stats.overallBalance.toFixed(2)}
          </h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Bilancio Totale</p>
        </div>
      </div>

      {/* Debts and Credits Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        {/* Debts - Who I need to pay */}
        <div className="card">
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>💸 Devi Pagare</h2>
          {Object.keys(debts).length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '1rem' }}>
              Non devi pagare nessuno 🎉
            </p>
          ) : (
            <div>
              {Object.entries(debts).map(([userName, data]) => (
                <div
                  key={userName}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#fee',
                    borderRadius: '8px',
                    borderLeft: '4px solid #e74c3c'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>{userName}</span>
                    <span style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1.1rem' }}>
                      €{data.amount.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                    {data.groups.map((g, idx) => (
                      <div key={idx} style={{ marginTop: '0.25rem' }}>
                        • {g.name}: €{g.amount.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credits - Who owes me */}
        <div className="card">
          <h2 style={{ color: '#2ecc71', marginBottom: '1rem' }}>💰 Ti Devono Pagare</h2>
          {Object.keys(credits).length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '1rem' }}>
              Nessuno ti deve soldi
            </p>
          ) : (
            <div>
              {Object.entries(credits).map(([userName, data]) => (
                <div
                  key={userName}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#efe',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2ecc71'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>{userName}</span>
                    <span style={{ fontWeight: '700', color: '#2ecc71', fontSize: '1.1rem' }}>
                      €{data.amount.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                    {data.groups.map((g, idx) => (
                      <div key={idx} style={{ marginTop: '0.25rem' }}>
                        • {g.name}: €{g.amount.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Groups Summary */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Riepilogo per Gruppo</h2>
        {groups.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '2rem' }}>
            Nessun gruppo disponibile
          </p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {groups.map(group => {
              const groupBalances = balances[group.id] || [];
              const userBalance = groupBalances.find(b => b.user_id === currentUser?.id);

              return (
                <Link
                  key={group.id}
                  to={`/expenses/groups/${group.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e9ecef';
                      e.currentTarget.style.borderColor = '#3498db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}
                  >
                    <div style={{ flex: '1 1 200px' }}>
                      <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>{group.nome}</h3>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.85rem' }}>
                        {group.members?.length || 0} membri • {group.expenses?.length || 0} spese
                      </p>
                    </div>
                    {userBalance && (
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>Pagato</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#2ecc71' }}>
                            €{userBalance.total_paid.toFixed(2)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>Dovuto</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#e67e22' }}>
                            €{userBalance.total_owed.toFixed(2)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '100px' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>Bilancio</p>
                          <p
                            style={{
                              margin: '0.25rem 0 0 0',
                              fontWeight: '700',
                              fontSize: '1.1rem',
                              color: userBalance.balance >= 0 ? '#2ecc71' : '#e74c3c'
                            }}
                          >
                            {userBalance.balance >= 0 ? '+' : ''}€{userBalance.balance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
