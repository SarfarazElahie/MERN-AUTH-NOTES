import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, logout, logoutAll } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Log out from ALL devices?")) return;
    await logoutAll();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/notes">← Back to Notes</Link>
      </header>

      <h1>Profile</h1>

      {user && (
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="profile-actions">
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleLogoutAll}>Logout All Devices</button>
      </div>
    </div>
  );
};

export default Profile;