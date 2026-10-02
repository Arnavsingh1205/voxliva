function Navbar({ onProfileClick, conversation = false, onBack }) {
  if (conversation) {
    return (
      <header className="navbar">
        <div className="logo">
          Vox<span>liva</span>
        </div>

        <button className="back-btn" onClick={onBack}>
          ← Change Character
        </button>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="logo">
        Vox<span>liva</span>
      </div>

      <nav>
        <a href="#home">Home</a>
        <a href="#characters">Characters</a>
        <a href="#practice">Practice</a>
        <a href="#learn">Learn</a>
      </nav>

      <button
        className="profile-btn"
        onClick={onProfileClick}
      >
        Profile
      </button>
    </header>
  );
}

export default Navbar;