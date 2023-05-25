import './sidebar.css';
import { useContext, useEffect, useState } from 'react';
import api from '../../apiConfig';
import {
  Link,
  useParams,
  useNavigate,
} from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Add, Remove } from '@mui/icons-material';

function ProfileSidebar({ user }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [friends, setFriends] = useState([]);
  const { user: currentUser, dispatch } =
    useContext(AuthContext);
  const [updatedUsers, setUpdatedUsers] = useState({});
  const username = useParams().username;
  const [isEditing, setIsEditing] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [newFrom, setNewFrom] = useState('');
  const [newRelationship, setNewRelationship] =
    useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getFriends = async () => {
      try {
        const friendList = await api.get(
          `/users/friends/${user?._id}`
        );
        setFriends(friendList.data);
      } catch (err) {
        console.log(err);
      }
    };
    getFriends();
  }, [user?._id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(
          `/users?username=${username}`,
          { cache: 'stale-while-revalidate' }
        );
        setUpdatedUsers(res.data);
        setIsFollowing(
          currentUser.followings?.includes(res.data._id)
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, [currentUser?.followings, username]);

  const handleClick = async () => {
    try {
      if (isFollowing) {
        await api.put(`/users/${user._id}/unfollow`, {
          userId: currentUser._id,
        });
        dispatch({ type: 'UNFOLLOW', payload: user._id });
      } else {
        await api.put(`/users/${user._id}/follow`, {
          userId: currentUser._id,
        });
        dispatch({ type: 'FOLLOW', payload: user._id });
      }

      const res = await api.get(
        `/users?username=${username}`,
        { cache: 'stale-while-revalidate' }
      );
      setUpdatedUsers(res.data);
      setIsFollowing(
        currentUser.followings?.includes(res.data._id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setNewCity(user.city);
    setNewFrom(user.from);
    setNewRelationship(user.relationship);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newCity') {
      setNewCity(value);
    } else if (name === 'newFrom') {
      setNewFrom(value);
    } else if (name === 'newRelationship') {
      setNewRelationship(value);
    }
  };

  const handleSaveClick = async () => {
    try {
      const updatedUser = {
        ...updatedUsers,
        city: newCity,
        from: newFrom,
        relationship: newRelationship,
      };

      await api.put(
        `/users/${user._id}/update?userId=${currentUser._id}`,
        updatedUser
      );

      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });

      window.location.reload();
      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChatClick = async () => {
    try {
      const response = await api.get(
        '/conversations/find/' +
          currentUser._id +
          '/' +
          user._id
      );
      const existingConversation = response.data;

      if (existingConversation) {
        // Redirect to the existing conversation
        navigate(
          `/conversation/${existingConversation._id}`
        );
      } else {
        // Create a new conversation
        const newConversation = await api.post(
          '/conversations',
          {
            senderId: currentUser._id,
            receiverId: user._id,
          }
        );
        const conversationId = newConversation.data._id;
        navigate(`/conversation/${conversationId}`);
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewCity(updatedUsers.city);
    setNewFrom(updatedUsers.from);
    setNewRelationship(updatedUsers.relationship);
  };

  return (
    <>
      <div className="followChat">
        <div>
          {user.username !== currentUser.username && (
            <button
              className="sidebarFollowButton"
              onClick={handleClick}>
              {isFollowing ? 'unfollow' : 'Follow'}
              {isFollowing ? <Remove /> : <Add />}
            </button>
          )}
        </div>
        <div>
          {isFollowing && (
            <div>
              <Link
                to={`/conversation/${user._id}`}
                className="sidebarChatButton"
                onClick={handleChatClick}>
                Chat Friend
              </Link>
            </div>
          )}
        </div>
      </div>

      <h4 className="sidebarTitle">User information</h4>
      <div className="sidebarInfo">
        {isEditing ? (
          <div className="sidebarInfoEdit">
            <div className="sidebarInfoItem">
              <span className="sidebarInfoKey">City:</span>
              <input
                type="text"
                name="newCity"
                value={newCity}
                onChange={handleInputChange}
              />
            </div>
            <div className="sidebarInfoItem">
              <span className="sidebarInfoKey">From:</span>
              <input
                type="text"
                name="newFrom"
                value={newFrom}
                onChange={handleInputChange}
              />
            </div>
            <div className="sidebarInfoItem">
              <span className="sidebarInfoKey">
                Relationship:
              </span>
              <select
                className="relationshipOptions"
                name="newRelationship"
                value={newRelationship}
                onChange={handleInputChange}>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
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
          </div>
        ) : (
          <div className="sidebarInfo">
            <div className="sidebarInfoItem">
              <span className="sidebarInfoKey">City:</span>
              <span className="sidebarInfoValue">
                {user.city}
              </span>
            </div>
            <div className="sidebarInfoItem">
              <span className="sidebarInfoKey">From:</span>
              <span className="sidebarInfoValue">
                {user.from}
              </span>
            </div>
            <div className="sidebarInfoItem">
              <span className="sidebarInfoKey">
                Relationship:
              </span>
              <span className="sidebarInfoValue">
                {user.relationship === 'Single'
                  ? 'Single'
                  : user.relationship === 'Married'
                  ? 'Married'
                  : 'Single'}
              </span>
            </div>
            {!isEditing &&
              user.username === currentUser.username && (
                <button
                  className="sidebarInfoEditButton"
                  onClick={handleEditClick}>
                  Edit
                </button>
              )}
          </div>
        )}

        <h4 className="sidebarTitle">User friends</h4>
        <div className="sidebarFollowings">
          {friends.map((friend, keyId) => (
            <Link
              key={keyId}
              to={'/profile/' + friend.username}
              style={{
                textDecoration: 'none',
                color: 'black',
              }}>
              <div className="sidebarFollowing">
                <img
                  src={
                    friend.profilePicture
                      ? PF + friend.profilePicture
                      : PF + 'person/noAvatar.png'
                  }
                  alt=""
                  className="sidebarFollowingImg"
                />
                <span className="sidebarFollowingName">
                  {friend.username}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default ProfileSidebar;
