import { useContext, useEffect, useState } from 'react';
import Feed from '../../components/feed/Feed';
import Sidebar from '../../components/sidebar/Sidebar';
import Topbar from '../../components/topbar/Topbar';
import './profile.css';
import axios from 'axios';
import { useParams } from 'react-router';
import { AuthContext } from '../../context/AuthContext';

function Profile() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: contextUser, dispatch } =
    useContext(AuthContext);
  const [user, setUser] = useState({});
  const username = useParams().username;

  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePicture', file);
      await axios.put(
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
      const res = await axios.get(
        `/users?username=${username}`,
        { cache: 'stale-while-revalidate' }
      );
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(
        `/users?username=${username}`,
        { cache: 'stale-while-revalidate' }
      );
      setUser(res.data);
    };

    fetchUser();
  }, [username]);

  return (
    <>
      <Topbar />
      <div className="profile">
        <div className="profileRight">
          <div className="profileRightTop">
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

              <div className="profilePictureOverlay">
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
                  <i className="fas fa-camera"></i>
                </label>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                  disabled={user._id !== contextUser._id}
                />
              </div>
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">
                {user.username}
              </h4>
              <span className="profileInfoDesc">
                {user.desc}
              </span>
            </div>
          </div>
          <div className="profileRightBottom">
            <Feed username={username} />
            <Sidebar user={user} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
