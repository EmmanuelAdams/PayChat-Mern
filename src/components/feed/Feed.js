import { useContext, useEffect, useState } from 'react';
import Post from '../post/Post';
import Share from '../share/Share';
import './feed.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = username
          ? await axios.get(`/posts/profile/${username}`)
          : await axios.get(`posts/timeline/${user._id}`);

        if (Array.isArray(res.data)) {
          setPosts(
            res.data.sort((p1, p2) => {
              return (
                new Date(p2.createdAt) -
                new Date(p1.createdAt)
              );
            })
          );
        } else {
          console.error(
            'Invalid response from server:',
            res.data
          );
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [username, user._id]);

  return (
    <>
      <div className="feed">
        <div className="feedWrapper">
          {(!username || username === user.username) && (
            <Share />
          )}
          {posts.map((p) => (
            <Post key={p._id} post={p} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Feed;
