import styles from '../styles/Home.module.css';
import { useState } from 'react';

function Home() {

  const [inscriptionEmail, setInscriptionEmail] = useState('');
  const [inscriptionPassword, setInscriptionPassword] = useState('');

  const [erreurInscription, setErreurInscription] = useState('');

  const SuivantInscription = () => {
    fetch('http://localhost:3000/users/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inscriptionEmail, password: inscriptionPassword }),
      credentials: 'include'
    }).then(response => response.json())
      .then(data => {
        if (data.result) {
            localStorage.setItem('accessToken', data.accessToken);
            window.location.href = '/main';
        } else {
          console.log(data.error)
          setErreurInscription(data.error)
        }
      });
  }

  const SuivantConnexion = () => {
    fetch('http://localhost:3000/users/connexion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inscriptionEmail, password: inscriptionPassword }),
      credentials: 'include'
    }).then(response => response.json())
      .then(data => {
        if (data.result) {
            localStorage.setItem('accessToken', data.accessToken);
            window.location.href = '/main';
        } else {
          console.log(data.error)
          setErreurInscription(data.error)
        }
      });
  }

  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Inscription/Connexion
        </h1>
        <text>{erreurInscription}</text>
        <input onChange={(e) => setInscriptionEmail(e.target.value)} value={inscriptionEmail} placeholder="Email"></input>
        <input onChange={(e) => setInscriptionPassword(e.target.value)} value={inscriptionPassword} placeholder="Mot de passe"></input>
        <button onClick={SuivantInscription}>Entrer</button>
        <button onClick={SuivantConnexion}>Se connecter</button>
      </main>
    </div>
  );
}

export default Home;
