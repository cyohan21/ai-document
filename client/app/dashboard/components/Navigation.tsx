import { styles } from '../styles/dashboard.styles';

export default function Navigation() {
  return (
    <nav style={styles.nav}>
      <div style={styles.navContent}>
        <a href="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <div style={styles.logoIconInner}></div>
          </div>
          <span style={styles.logoText}>Document AI</span>
        </a>
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            <svg style={styles.userIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>John Doe</div>
            <div style={styles.userAccount}>Personal Account</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
