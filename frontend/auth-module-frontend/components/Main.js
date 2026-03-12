import styles from '../styles/Main.module.css';
import { useState, useEffect } from 'react';

function Main() {
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState([]);


  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/sessions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      if (data.result) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Erreur chargement session:', error);
    }
  };

const handlelogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}`}
      });
      
      const data = await response.json();
      
      if (data.result) {
        localStorage.removeItem('accessToken');
        setMessage('Déconnexion réussie');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      setMessage('Erreur lors de la déconnexion');
    }
  };

  const handlelogoutall = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/logout/all', {
        method: 'POST',
        credentials: 'include',
        headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}`}
      });
      
      const data = await response.json();
      
      if (data.result) {
        localStorage.removeItem('accessToken');
        setMessage(data.message || 'Toutes vos sessions ont été déconnectées');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur déconnexion globale:', error);
      setMessage('Erreur lors de la déconnexion globale');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:3000/users/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {'Authorization': `Bearer ${localStorage.getItem('accessToken')}`}
      });
      
      const data = await response.json();
      
      if (data.result) {
        fetchSessions();
        setMessage('Session révoquée avec succès');
        if (data.isCurrentSession) {
          localStorage.removeItem('accessToken');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Erreur révocation:', error);
    }
  };

  const formatIpAddress = (ip) => {
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return 'localhost (127.0.0.1)';
  }
  return ip;
};

  return (
    <div>
      <main className={styles.main}>
        <h2>Bienvenue sur vore espace personnel !</h2>
        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}
        <div className={styles.groupeButtons}>
        <button className={styles.logoutButton} onClick={handlelogout}>Logout</button>
        <button className={styles.logoutAllButton} onClick={handlelogoutall}>Logout toutes les sessions</button>
        </div>
        {sessions.length > 0 && (
          <div className={styles.sessionsSection}>
            <h3>Sessions actives ({sessions.length})</h3>
            <div className={styles.sessionsList}>
              {sessions.map((session) => (
                <div key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionInfo}>
                    <p>Appareil: {session.userAgent}</p>
                    <p>IP: {formatIpAddress(session.ipAddress)}</p>
                    <p>Connecté depuis: {new Date(session.createdAt).toLocaleString()}</p>
                    <p>Dernière activité: {new Date(session.lastUsedAt).toLocaleString()}</p>
                    {session.isCurrent && (
                      <span className={styles.currentBadge}>Appareil actuel</span>
                    )}
                  </div>
                  {!session.isCurrent && (
                    <button 
                      onClick={() => handleRevokeSession(session.id)}
                      className={styles.revokeButton}>
                      Révoquer cette session
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Main;
