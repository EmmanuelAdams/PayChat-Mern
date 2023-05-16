import { Link } from 'react-router-dom';
import {
  Chat,
  Notifications,
  Search,
  Settings,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import './topbar.css';
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../apiConfig';

function Topbar() {
  const { user: currentUser } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const searchRef = useRef();

  const handleSearch = async () => {
    try {
      const response = await api.get(
        `search/users?query=${searchQuery}`
      );
      setSearchResults(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setSearchResults(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/">
          <img
            src="../../assets/logo/icon.png"
            alt="logo"
            title="Home"
            className="logo"
          />
        </Link>
      </div>

      <div className="topbarCenter">
        <div className="searchbar" ref={searchRef}>
          <Search className="searchIcon" />
          <input
            placeholder="Search PayChat..."
            className="searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>

        {searchResults && searchResults.length > 0 ? (
          <div className="searchResults" ref={searchRef}>
            {searchResults.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                key={user._id}
                onClick={() => setSearchResults([])}
                style={{ textDecoration: 'none' }}>
                <div className="searchResultItem">
                  <img
                    src={
                      user.profilePicture
                        ? PF + user.profilePicture
                        : PF + 'person/noAvatar.png'
                    }
                    alt="profile"
                    className="searchResultImg"
                  />
                  <span
                    className="searchResultUsername"
                    style={{ color: 'black' }}>
                    {user.username}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          searchResults !== null && (
            <div className="searchResults" ref={searchRef}>
              No user found
            </div>
          )
        )}
      </div>

      <div className="topbarRight">
        <div className="topbarImgText">
          <Link to={`/profile/${currentUser.username}`}>
            <img
              src={
                currentUser.profilePicture
                  ? PF + currentUser.profilePicture
                  : PF + 'person/noAvatar.png'
              }
              title="Profile"
              alt="profile"
              className="topbarImg"
            />
          </Link>

          <h4>{currentUser.username}</h4>
        </div>

        <div className="topbarIcons">
          <Link to={'/messenger'}>
            <IconButton className="iconButton">
              <div className="topbarIconItem">
                <Chat
                  className="icon"
                  titleAccess="Messenger"
                />
              </div>
            </IconButton>
          </Link>
          <IconButton className="iconButton">
            <div className="topbarIconItem">
              <Notifications
                className="icon"
                titleAccess="Notifications"
              />
            </div>
          </IconButton>
          <Link to={'/settings'}>
            <IconButton className="iconButton">
              <div className="topbarIconItem">
                <Settings
                  className="icon"
                  titleAccess="Settings"
                />
              </div>
            </IconButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
