function Layout({ children, route, modules, onNavigate, dailyMode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" type="button" onClick={() => onNavigate("dashboard")}>
          <span className="brand-mark">TL</span>
          <span>
            <strong>Talibrate English Practice Lab</strong>
            <small>Workplace communication studio</small>
          </span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              className={route === module.id ? "nav-link active" : "nav-link"}
              onClick={() => onNavigate(module.id)}
            >
              {module.label}
            </button>
          ))}
        </nav>
        <button className="daily-button" type="button" onClick={() => onNavigate("daily")}>
          Daily Practice
        </button>
      </header>

      <main className={dailyMode ? "main-view daily-view" : "main-view"}>
        {children}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {modules.map((module) => (
          <button
            key={module.id}
            type="button"
            className={route === module.id ? "mobile-link active" : "mobile-link"}
            onClick={() => onNavigate(module.id)}
          >
            {module.shortLabel}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Layout;
