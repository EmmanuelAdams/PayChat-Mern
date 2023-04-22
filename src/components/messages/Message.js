import './message.css';
import { format } from 'timeago.js';
import { useState, useRef, useEffect } from 'react';
import { Delete } from '@mui/icons-material';
import axios from 'axios';

export default function Message({
  message,
  own,
  deleteMessage,
}) {
  const [showDeleteIcon, setShowDeleteIcon] =
    useState(false);
  const messageRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        messageRef.current &&
        !messageRef.current.contains(event.target)
      ) {
        setShowDeleteIcon(false);
      }
    }

    window.addEventListener('click', handleClickOutside);
    return () =>
      window.removeEventListener(
        'click',
        handleClickOutside
      );
  }, [messageRef]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowDeleteIcon(true);
  };

  const handleDeleteMessage = async () => {
    try {
      await axios.delete(`/messages/${message._id}`);
      deleteMessage(message._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick = () => {
    setShowDeleteIcon(false);
  };

  return (
    <div
      className={own ? 'message own' : 'message'}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      ref={messageRef}>
      <div className="messageTop">
        <p className="messageText">{message.text}</p>
        {own && showDeleteIcon && (
          <div className="messageDeleteContainer">
            <Delete
              htmlColor="red"
              className="messageDelete"
              onClick={handleDeleteMessage}
            />
          </div>
        )}
      </div>
      <div className="messageBottom">
        {format(message.createdAt)}
      </div>
    </div>
  );
}
