import styles from '../styles/Main.module.css';

function Main() {
  const [message, setMessage] = useState('');

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
        <button onClick={handlelogout}>Logout</button>
        <button onClick={handlelogoutall}>Logout toutes les sessions</button>
        </div>
      </main>
    </div>
  );
}

export default Main;
