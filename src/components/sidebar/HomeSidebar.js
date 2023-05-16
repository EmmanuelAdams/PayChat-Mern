import './sidebar.css';
import ChatOnline from '../chatOnline/ChatOnline';

function HomeSidebar() {
  return (
    <>
      <div className="adContainer">
        <img
          className="sidebarAd"
          src="https://picsum.photos/300/400/?random"
          alt=""
        />
      </div>
      <h4 className="sidebarTitle">Online Friends</h4>
      <ul className="sidebarFriendList">
        <ChatOnline />
      </ul>
    </>
  );
}

export default HomeSidebar;
