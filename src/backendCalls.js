import api from './apiConfig';

export const loginCall = async (
  userCredentials,
  dispatch
) => {
  dispatch({ type: 'LOGIN_START' });
  try {
    const res = await api.post(
      '/auth/login',
      userCredentials
    );
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE' });
    if (error.response) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(
        'An error occurred. Please try again later.'
      );
    }
  }
};
