import Icon from './Icon.jsx'

const links = [
  { label: 'Dashboard', href: '#dashboard', icon: 'dashboard' },
  { label: 'Register Learner', href: '#register', icon: 'userPlus' },
  { label: 'Course Enrollment', href: '#enrollment', icon: 'book' },
  { label: 'Waitlist', href: '#waitlist', icon: 'list' },
  { label: 'Eligibility Management', href: '#eligibility', icon: 'shield' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#dashboard" aria-label="CourseFlow home">
        <span className="brand-mark"><Icon name="spark" size={21} /></span>
        <span>Course<span className="brand-accent">Flow</span></span>
      </a>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {links.map((link, index) => (
          <a className={`side-nav-link${index === 0 ? ' current' : ''}`} href={link.href} key={link.href}>
            <Icon name={link.icon} size={19} />
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note-icon"><Icon name="shield" size={17} /></div>
        <p>Enrollment and waitlist rules are managed by your course backend.</p>
        <span className="sidebar-version">COURSEFLOW · REGISTRATION</span>
      </div>
    </aside>
  )
}

export default Sidebar
