import Icon from './Icon.jsx'

function Notification({ notification, onDismiss }) {
  if (!notification) return null
  const icon = notification.type === 'success' ? 'check' : notification.type === 'error' ? 'alert' : 'clock'

  return (
    <div className={`notification notification-${notification.type}`} role={notification.type === 'error' ? 'alert' : 'status'}>
      <span className="notification-icon"><Icon name={icon} size={18} /></span>
      <div className="notification-copy"><strong>{notification.title}</strong><span>{notification.message}</span></div>
      <button type="button" className="notification-close" onClick={onDismiss} aria-label="Dismiss notification">
        <Icon name="x" size={17} />
      </button>
    </div>
  )
}

export default Notification
