export const styles = {
  // Main container
  container: {
    minHeight: '100vh',
    backgroundColor: 'white',
  },

  // Navigation
  nav: {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    background: 'linear-gradient(to bottom right, rgb(192, 132, 252), rgb(147, 51, 234))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconInner: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'rgb(17, 24, 39)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
  },
  userAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: 'rgb(209, 213, 219)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: 'rgb(75, 85, 99)',
  },
  userInfo: {
    textAlign: 'left' as const,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'rgb(17, 24, 39)',
  },
  userAccount: {
    fontSize: '0.75rem',
    color: 'rgb(107, 114, 128)',
  },

  // Main content
  mainContent: {
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '0 1.5rem',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
  },
  title: {
    fontSize: '3.75rem',
    fontWeight: 600,
    color: 'rgb(17, 24, 39)',
    marginBottom: '1.5rem',
    lineHeight: 1.1,
    letterSpacing: '-0.025em',
  },
  description: {
    fontSize: '1.25rem',
    color: 'rgb(75, 85, 99)',
    marginBottom: '3rem',
    lineHeight: 1.75,
  },

  // Error message
  error: {
    marginBottom: '1.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgb(254, 242, 242)',
    border: '1px solid rgb(254, 202, 202)',
    borderRadius: '0.5rem',
    color: 'rgb(185, 28, 28)',
    textAlign: 'center' as const,
    maxWidth: '28rem',
    margin: '0 auto 1.5rem',
  },

  // Upload zone
  uploadContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  uploadLabel: {
    display: 'block',
    width: '100%',
    maxWidth: '42rem',
  },
  fileInput: {
    display: 'none',
  },
  dropZone: {
    cursor: 'pointer',
    padding: '3rem 6rem',
    background: 'linear-gradient(to bottom right, rgb(250, 245, 255), rgb(243, 232, 255))',
    border: '2px dashed rgb(216, 180, 254)',
    borderRadius: '1.5rem',
    transition: 'all 0.3s',
  },
  dropZoneContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1.5rem',
  },
  uploadIconContainer: {
    width: '5rem',
    height: '5rem',
    borderRadius: '50%',
    backgroundColor: 'rgb(147, 51, 234)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
  },
  uploadIcon: {
    width: '2.5rem',
    height: '2.5rem',
    color: 'white',
  },
  uploadTextContainer: {
    textAlign: 'center' as const,
  },
  uploadTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'rgb(17, 24, 39)',
    marginBottom: '0.5rem',
  },
  uploadSubtitle: {
    fontSize: '1rem',
    color: 'rgb(75, 85, 99)',
  },
};
