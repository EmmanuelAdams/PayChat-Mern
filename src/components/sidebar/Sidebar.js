import HomeSidebar from './HomeSidebar';
import ProfileSidebar from './ProfileSidebar';
import './sidebar.css';

function Sidebar({ user }) {
  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        {user ? (
          <ProfileSidebar user={user} />
        ) : (
          <HomeSidebar />
        )}
      </div>
    </div>
  );
}

export default Sidebar;
