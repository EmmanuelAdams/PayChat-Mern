import './login.css';
import { useContext, useRef, useState } from 'react';
import { loginCall } from '../../backendCalls';
import { AuthContext } from '../../context/AuthContext';
import { CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Login() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      setError('');
      await loginCall(
        {
          email: email.current.value,
          password: password.current.value,
        },
        dispatch
      );
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginTop">
          <img
            src={PF + 'logo/fullwide.png'}
            alt=""
            className="loginImg"
          />
        </div>
        <form className="loginBody" onSubmit={handleClick}>
          <input
            type="email"
            required
            placeholder="Email"
            className="loginInput"
            ref={email}
          />
          <div className="passwordInputContainer">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Password"
              className="loginInput"
              ref={password}
            />
            {showPassword ? (
              <VisibilityIcon
                className="passwordVisibilityIcon"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              />
            ) : (
              <VisibilityOffIcon
                className="passwordVisibilityIcon"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              />
            )}
          </div>
          {error && (
            <div className="loginError">{error}</div>
          )}
          <button
            className="loginButton"
            type="submit"
            disabled={isFetching}>
            {isFetching ? (
              <CircularProgress
                color="inherit"
                size="20px"
              />
            ) : (
              'Log In'
            )}
          </button>
          <span className="loginForgot">
            Forgot Password?
          </span>
          <Link to="/register">
            <button
              className="loginButton"
              type="submit"
              disabled={isFetching}>
              {isFetching ? (
                <CircularProgress
                  color="inherit"
                  size="20px"
                />
              ) : (
                'Create New Account'
              )}
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
