import styles from '../styles/Home.module.css';

function Home() {
  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Connection/Inscription
        </h1>
        <input placeholder="Nom d'utilisateur"></input>
        <input placeholder="Mot de passe"></input>
        <button>Entrer</button>
      </main>
    </div>
  );
}

export default Home;
