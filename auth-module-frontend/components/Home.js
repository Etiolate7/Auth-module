import styles from '../styles/Home.module.css';
import { useState } from 'react';

function Home() {

    const [connectionEmail, setConnectionEmail] = useState('');
    const [connectionPassword, setConnectionPassword] = useState('');

    const [inscriptionEmail, setInscriptionEmail] = useState('');
    const [inscriptionPassword, setInscriptionPassword] = useState('');

    const [erreurConnection, setErreurConnection] = useState('');
    const [erreurInscription, setErreurInscription] = useState('');

const SuivantConnection = () => {
  console.log('yay!');
}

const SuivantInscription = () => {
  console.log('whoho!!');
}


  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Connection
        </h1>
        <input onChange={(value) => setConnectionEmail(value)} value={connectionEmail} placeholder="Email"></input>
        <input onChange={(value) => setConnectionPassword(value)} value={connectionPassword} placeholder="Mot de passe"></input>
        <button onClick={SuivantConnection}>Se connecter</button>
        <h1 className={styles.title}>
            Inscription
        </h1>
        <input onChange={(value) => setInscriptionEmail(value)} value={inscriptionEmail} placeholder="Email"></input>
        <input onChange={(value) => setInscriptionPassword(value)} value={inscriptionPassword} placeholder="Mot de passe"></input>
        <button onClick={SuivantInscription}>S'inscrire</button>
      </main>
    </div>
  );
}

export default Home;
