import styles from '../styles/Main.module.css';

function Main() {

const handlelogout = () => {
  fetch('http://localhost:3000/users/logout', {
    method: 'POST',
    credentials: 'include'
  }).then(() => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  });
};

  return (
    <div>
      <main className={styles.main}>
        <h2>Hello!!</h2>
        <button onClick={handlelogout}>Logout</button>
      </main>
    </div>
  );
}

export default Main;
