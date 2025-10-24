import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const apps = [
    {
      title: 'Gestione Spese',
      description: 'Gestisci le tue spese in gruppo, dividi i costi e monitora i bilanci',
      icon: '💰',
      link: '/expenses',
      color: '#3498db',
    },
    {
      title: 'Lista della Spesa',
      description: 'Crea e condividi liste della spesa con gli altri utenti',
      icon: '🛒',
      link: '/shopping',
      color: '#2ecc71',
    },
    {
      title: 'Schede Palestra',
      description: 'Organizza i tuoi allenamenti con schede personalizzate',
      icon: '💪',
      link: '/gym',
      color: '#e74c3c',
    },
  ];

  return (
    <div className="container">
      <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>
          Benvenuto, {user?.nome}!
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
          Seleziona un'applicazione per iniziare
        </p>
      </div>

      <div className="grid">
        {apps.map((app, index) => (
          <Link
            key={index}
            to={app.link}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              className="card"
              style={{
                borderTop: `4px solid ${app.color}`,
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {app.icon}
              </div>
              <h2 style={{ color: app.color, marginBottom: '0.5rem' }}>
                {app.title}
              </h2>
              <p style={{ color: '#7f8c8d' }}>{app.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
