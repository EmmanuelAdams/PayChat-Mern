import { Container } from '@mui/material';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';
import Login from './pages/login/Login';
import Register from './pages/register/Register';

import './app.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Messenger from './pages/messenger/Messenger';
import SettingsPage from './pages/settingsPage/SettingsPage';
import ErrorBoundary from './components/ErrorBoundary';

function PageNotFound() {
  return (
    <div>
      <h3>
        Something went wrong while processing your
        request...
      </h3>
      <Link to="/">Go home</Link>
    </div>
  );
}

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="app">
        <Container>
          <div className="container">
            <ErrorBoundary>
              <Routes>
                <Route
                  exact
                  path="/"
                  element={user ? <Home /> : <Register />}
                />
                <Route
                  path="/profile/:username"
                  element={<Profile />}
                />
                <Route
                  path="/login"
                  element={
                    user ? (
                      <Navigate to="/" replace={true} />
                    ) : (
                      <Login />
                    )
                  }
                />
                <Route
                  path="/register"
                  element={
                    user ? (
                      <Navigate to="/" replace={true} />
                    ) : (
                      <Register />
                    )
                  }
                />
                <Route
                  path="/messenger"
                  element={
                    !user ? (
                      <Navigate to="/" replace={true} />
                    ) : (
                      <Messenger />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    !user ? (
                      <Navigate to="/" replace={true} />
                    ) : (
                      <SettingsPage />
                    )
                  }
                />
                <Route
                  path="*"
                  element={<PageNotFound />}
                />
              </Routes>
            </ErrorBoundary>
          </div>
        </Container>
      </div>
    </Router>
  );
}

export default App;