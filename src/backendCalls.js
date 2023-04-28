import api from '../../apiConfig';

export const loginCall = async (
  userCredentials,
  dispatch
) => {
  dispatch({ type: 'LOGIN_START' });
  try {
<<<<<<< HEAD
    const res = await axios.post(
      'https://paychat-api.onrender.com/api/auth/login',
=======
    const res = await api.post(
      '/auth/login',
>>>>>>> 22418d8 (backend apiConfig)
      userCredentials
    );
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE', payload: error });
  }
};
