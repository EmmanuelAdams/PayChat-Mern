import api from '../../apiConfig';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './conversation.css';

export default function Conversation({
  conversation,
  currentUser,
  selected,
}) {
  const [user, setUser] = useState({
    username: '',
    profilePicture: '',
  });
  const [friendId, setFriendId] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    if (conversation) {
      const newFriendId = conversation.members.find(
        (member) => member !== currentUser._id
      );
      setFriendId(newFriendId);
    }
  }, [conversation, currentUser]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await api(`/users/${friendId}`);
        setUser(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    if (friendId) {
      getUser();
    }
  }, [friendId]);

  return (
    <div className="conversationWrapper">
      <div
        className={`conversation ${
          selected ? 'selected' : ''
        }`}>
        {user && (
          <>
            <Link to={`/profile/${user.username}`}>
              <img
                className="conversationImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + '/person/noAvatar.png'
                }
                alt=""
              />
            </Link>
            <span className="conversationName">
              {user.username}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
