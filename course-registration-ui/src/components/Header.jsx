import Icon from './Icon.jsx'

function Header({ onRefresh, refreshing, connectionError }) {
  return (
    <header className="top-header">
      <div>
        <div className="breadcrumb">Workspace <span>/</span> Course overview</div>
        <h1>Course Registration Dashboard</h1>
      </div>
      <div className="header-actions">
        {connectionError && (
          <span className="connection-indicator" role="status">
            <span className="connection-dot" />Backend unavailable
          </span>
        )}
        <button className="button button-secondary refresh-button" type="button" onClick={onRefresh} disabled={refreshing}>
          <Icon name="refresh" size={17} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh course state'}
        </button>
      </div>
    </header>
  )
}

export default Header
