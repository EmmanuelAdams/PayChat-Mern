import {
  CommentOutlined,
  Delete,
  MoreVert,
  Reply,
} from '@mui/icons-material';
import './post.css';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';

function Post({ post }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users/${post.userId}`, {
        cache: 'stale-while-revalidate',
      });

      setUser(res.data);
    };

    fetchUser();
  }, [post.userId]);

  const likeHandler = () => {
    try {
      axios.put('/posts/' + post._id + '/like', {
        userId: currentUser._id,
      });
    } catch (error) {}
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const deletePost = async () => {
    try {
      await axios.delete(`/posts/${post._id}`, {
        data: { userId: currentUser._id },
      });
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            {user._id === currentUser._id ? (
              <img
                className="postProfileImg"
                src={
                  currentUser.profilePicture
                    ? PF + currentUser.profilePicture
                    : PF + 'person/noAvatar.png'
                }
                alt=""
              />
            ) : (
              <Link
                to={
                  window.location.pathname ===
                  `/profile/${user.username}`
                    ? ''
                    : `/profile/${user.username}`
                }>
                <img
                  className="postProfileImg"
                  src={
                    user.profilePicture
                      ? PF + user.profilePicture
                      : PF + 'person/noAvatar.png'
                  }
                  alt=""
                />
              </Link>
            )}

            <span className="postUsername">
              {user.username}
            </span>
            <span className="postDate">
              {format(post.createdAt)}
            </span>
          </div>
          <div className="postTopRight">
            {user._id === currentUser._id ? (
              <Delete onClick={deletePost} />
            ) : (
              ''
            )}

            <MoreVert />
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          <img
            className="postImg"
            src={PF + post.img || post.img}
            alt=""
          />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              onClick={likeHandler}
              src={`${PF}redheart.ico`}
              alt=""
            />
            <span className="postLikeCounter">
              {like} likes
            </span>
          </div>
          <div className="postBottomCenter">
            <CommentOutlined className="commentIcon" />
            <span className="postCommentText">
              {post.comment} comments
            </span>
          </div>
          <div className="postBottomRight">
            <Reply className="replyIcon" />
            <span className="postShareText">share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
