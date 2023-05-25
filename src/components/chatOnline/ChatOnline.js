import api from '../../apiConfig';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './chatOnline.css';

export default function ChatOnline({
  onlineUsers,
  currentId,
  setCurrentChat,
}) {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    const getFriends = async () => {
      try {
        const res = await api.get(
          `/users/friends/${currentId}`
        );
        setFriends(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getFriends();
  }, [currentId]);

  useEffect(() => {
    if (Array.isArray(friends)) {
      setOnlineFriends(
        friends.filter((f) => onlineUsers.includes(f._id))
      );
    } else {
      console.error('Invalid friends data:', friends);
    }
  }, [friends, onlineUsers]);

  // const handleClick = async (user) => {
  //   try {
  //     const res = await api.get(
  //       `/conversations/find/${currentId}/${user._id}`
  //     );
  //     setCurrentChat(res.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div className="chatOnline">
      {onlineFriends.map((o) => (
        <div
          key={Math}
          className="chatOnlineFriend"
          // onClick={() => handleClick(o)}
        >
          <div className="chatOnlineImgContainer">
            <Link to={`/profile/${o.username}`}>
              <img
                className="chatOnlineImg"
                src={
                  o?.profilePicture
                    ? PF + o.profilePicture
                    : PF + 'person/noAvatar.png'
                }
                alt=""
              />
            </Link>
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">
            {o?.username}
          </span>
        </div>
      ))}
    </div>
  );
}
