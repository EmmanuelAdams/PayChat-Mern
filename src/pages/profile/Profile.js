import { useContext, useEffect, useState } from 'react';
import Feed from '../../components/feed/Feed';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import './profile.css';
import api from '../../apiConfig';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';

function Profile() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: contextUser, dispatch } =
    useContext(AuthContext);
  const [user, setUser] = useState({});
  const username = useParams().username;
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePicture', file);
      await api.put(
        `/users/${user._id}/profilePicture`,
        formData
      );

      // Update user profile picture in state
      const updatedUser = {
        ...contextUser,
        profilePicture: file.name,
      };
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });

      // Use stale-while-revalidate strategy to refresh the data
      const res = await api.get(
        `/users?username=${username}`,
        {
          cache: 'stale-while-revalidate',
        }
      );
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(
          `/users?username=${username}`,
          {
            cache: 'stale-while-revalidate',
          }
        );
        setUser(res.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, [username]);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewUsername(user.username);
  };

  const handleSaveClick = async () => {
    try {
      const updatedUser = {
        ...user,
        username: newUsername,
      };
      await api.put(
        `/users/${user._id}/update?userId=${contextUser._id}`,
        updatedUser
      );

      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });

      setIsEditing(false);
      navigate(`/profile/${newUsername}`);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewUsername(user.username);
  };

  const getProfilePictureInput = () => {
    // Check if the device supports file input (Android/iOS)
    if (
      window.File &&
      window.FileReader &&
      window.FileList &&
      window.Blob
    ) {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.setAttribute('type', 'file');
      fileInput.setAttribute('accept', '.png,.jpg,.jpeg');
      fileInput.addEventListener(
        'change',
        handleProfilePictureUpload
      );

      // Trigger file input click programmatically
      fileInput.click();
    } else {
      // File input not supported, fallback to the default behavior
      const profilePictureInput = document.getElementById(
        'profilePictureInput'
      );
      profilePictureInput.click();
    }
  };

  return (
    <>
      <Topbar />
      <div className="profile">
        <div className="profileRight">
          <div className="profileRightTop">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className="profileCover">
                  <img
                    className="profileCoverImg"
                    src={
                      user.coverPicture
                        ? PF + user.coverPicture
                        : PF + 'person/noImage.png'
                    }
                    alt=""
                  />

                  <div
                    className="profilePictureOverlay"
                    onClick={getProfilePictureInput}>
                    <label htmlFor="profilePictureInput">
                      <div className="profileUserImgWrapper">
                        <img
                          title="Click to change"
                          className="profileUserImg"
                          src={
                            user.profilePicture
                              ? PF + user.profilePicture
                              : PF + 'person/noAvatar.png'
                          }
                          alt=""
                        />
                      </div>
                    </label>
                    <input
                      id="profilePictureInput"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                      disabled={
                        user._id !== contextUser._id
                      }
                      onChange={handleProfilePictureUpload}
                    />
                  </div>
                </div>
                <div className="profileInfo">
                  <div className="edit">
                    {isEditing ? (
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) =>
                          setNewUsername(e.target.value)
                        }
                      />
                    ) : (
                      <h4 className="profileInfoName">
                        {user.username}
                      </h4>
                    )}

                    {!isEditing &&
                      user._id === contextUser._id && (
                        <i
                          className="usernameEdit"
                          onClick={handleEditClick}>
                          <DriveFileRenameOutlineOutlinedIcon className="editIcon" />
                        </i>
                      )}
                    {isEditing && (
                      <>
                        <button
                          onClick={handleSaveClick}
                          className="editSaveOption">
                          Save
                        </button>
                        <button
                          onClick={handleCancelClick}
                          className="editCancelOption">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                  <span className="profileInfoDesc">
                    {user.desc}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="profileRightBottom">
            <Sidebar
              classname="sidebar-mobile"
              user={user}
            />
            <Feed username={username} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
