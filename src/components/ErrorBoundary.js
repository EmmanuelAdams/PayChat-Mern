import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, redirect: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(
      'ErrorBoundary caught an error',
      error,
      info
    );
  }

  componentDidMount() {
    if (this.state.hasError) {
      setTimeout(
        () => this.setState({ redirect: true }),
        5000
      );
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate replace="/" />;
    }

    if (this.state.hasError) {
      return (
        <h2>
          This listing has an error.{' '}
          <Link
            to="/"
            onClick={() => window.location.reload()}>
            Click here
          </Link>{' '}
          if nothing happens after five seconds.
        </h2>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
