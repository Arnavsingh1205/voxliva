function Profile({
  user = null,
  onLogout,
}) {
  const name = user?.name || "Voxliva User";
  const email = user?.email || "Not logged in";

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="section-label">
              Your Profile
            </span>

            <h1>{name}</h1>

            <p>{email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <strong>
              {user?.conversations ?? 0}
            </strong>
            <span>Conversations</span>
          </div>

          <div className="profile-stat">
            <strong>
              {user?.practiceMinutes ?? 0}
            </strong>
            <span>Practice Minutes</span>
          </div>

          <div className="profile-stat">
            <strong>
              {user?.streak ?? 0}
            </strong>
            <span>Day Streak</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

export default Profile;