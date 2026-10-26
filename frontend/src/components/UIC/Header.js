function Header() {
  return (
    <header className="tm-header">
      <div className="tm-header-inner">
        <a href="/" className="tm-brand">
          TravelMemory
        </a>

        <nav className="tm-nav">
          <a href="/" className="tm-nav-link">
            Places We Visited
          </a>

          <a href="/addexperience" className="tm-nav-button">
            + Add Experience
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
