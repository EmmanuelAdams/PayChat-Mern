export const loginStart = (userCredentials) => ({
  type: 'LOGIN_START',
});

export const loginSuccess = (user) => ({
  type: 'LOGIN_SUCCESS',
  payload: user,
});

export const loginFailure = () => ({
  type: 'LOGIN_FAILURE',
});

export const follow = (userId) => ({
  type: 'FOLLOW',
  payload: userId,
});

export const unfollow = (userId) => ({
  type: 'UNFOLLOW',
  payload: userId,
});

export const updateUser = (updatedUser) => ({
  type: 'UPDATE_USER',
  payload: updatedUser,
});
