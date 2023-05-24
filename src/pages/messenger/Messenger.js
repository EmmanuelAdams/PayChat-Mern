import './messenger.css';
import Topbar from '../../components/topbar/Topbar';
import Conversation from '../../components/conversations/Conversation';
import Message from '../../components/messages/Message';
import ChatOnline from '../../components/chatOnline/ChatOnline';
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../apiConfig';
import SendIcon from '@mui/icons-material/Send';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] =
    useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef();
  const [selectedConversation, setSelectedConversation] =
    useState(null);
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();
  const { conversationId } = useParams();

  useEffect(() => {
    socketRef.current = io(
      'https://paychat-websockets.onrender.com'
    );
    socketRef.current.on('getMessage', (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(
        arrivalMessage.sender
      ) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socketRef.current.emit('addUser', user._id);
    socketRef.current.on('getUsers', (users) => {
      setOnlineUsers(
        user.followings.filter((f) =>
          users.some((u) => u.userId === f)
        )
      );
    });
  }, [user]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await api.get(
          `/conversations/${user._id}`
        );
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await api.get(
          `/messages/${currentChat?._id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    const selectedConversation = conversations.find(
      (conversation) => conversation._id === conversationId
    );

    if (selectedConversation) {
      setCurrentChat(selectedConversation);
      setSelectedConversation(selectedConversation._id);
    }
  }, [conversations, conversationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === '') {
      return;
    }

    let formattedMessage = newMessage.replace(
      /(\d+\.\s+)/g,
      '\n$1'
    );

    const message = {
      sender: user._id,
      text: formattedMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socketRef.current.emit('sendMessage', {
      senderId: user._id,
      receiverId,
      text: formattedMessage,
    });

    try {
      const res = await api.post('/messages', message);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.log(err);
    }
  };

  const deleteMessage = (messageId) => {
    setMessages((prevMessages) =>
      prevMessages.filter(
        (message) => message._id !== messageId
      )
    );
  };

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input
              placeholder="Search for friends"
              className="chatMenuInput"
            />
            {conversations.map((c) => (
              <div
                key={c._id}
                onClick={() => {
                  setCurrentChat(c);
                  setSelectedConversation(c._id);
                }}>
                <Conversation
                  key={c._id}
                  conversation={c}
                  currentUser={user}
                  selected={selectedConversation === c._id}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div key={m._id} ref={scrollRef}>
                      <Message
                        key={m._id}
                        message={m}
                        own={m.sender === user._id}
                        deleteMessage={deleteMessage}
                      />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="write something..."
                    onChange={(e) =>
                      setNewMessage(e.target.value)
                    }
                    value={newMessage}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}></textarea>
                  <button
                    className="chatSubmitButton"
                    onClick={handleSubmit}>
                    <SendIcon />
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <span>Online Users</span>
            <ChatOnline
              onlineUsers={onlineUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}
