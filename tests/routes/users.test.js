const request = require('supertest');
const server = require('../../index');
const mongoose = require('mongoose');
const User = require('../../models/user');

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  server.close();
  // await User.deleteMany();
  await mongoose.disconnect();
});

describe('User API', () => {
  // GET user by ID
  describe('GET user by ID', () => {
    let user;

    beforeAll(async () => {
      user = await User.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    it('responds with a 200 status code when given a valid ID', async () => {
      const res = await request(server).get(
        `/api/users/${user._id}`
      );
      expect(res.statusCode).toBe(200);
    });

    it('responds with a user object when given a valid ID', async () => {
      const res = await request(server).get(
        `/api/users/${user._id}`
      );
      expect(res.body).toMatchObject({
        username: 'testuser',
        email: 'testuser@example.com',
      });
    });

    it('responds with a 500 status code when given an invalid ID', async () => {
      const res = await request(server).get(
        '/api/users/123'
      );
      expect(res.statusCode).toBe(500);
    });
  });

  // GET user by username
  describe('GET user by username', () => {
    let user;

    beforeAll(async () => {
      user = await User.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    it('responds with a 200 status code when given a valid username', async () => {
      const res = await request(server)
        .get('/api/users')
        .query({ username: 'testuser' });
      expect(res.statusCode).toBe(200);
    });

    it('responds with a user object when given a valid username', async () => {
      const res = await request(server)
        .get('/api/users')
        .query({ username: 'testuser' });
      expect(res.body).toMatchObject({
        username: 'testuser',
        email: 'testuser@example.com',
      });
    });

    it('responds with a 500 status code when given an invalid username', async () => {
      const res = await request(server)
        .get('/api/users')
        .query({ username: 'invalidusername' });
      expect(res.statusCode).toBe(500);
    });
  });

  // DELETE a user
  describe('DELETE a user', () => {
    let user;

    beforeAll(async () => {
      user = await User.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    it('should delete a user', async () => {
      const res = await request(server)
        .delete(`/api/users/${user._id}`)
        .send({ userId: user._id });
      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('Account deleted successfully');
    });

    it('should return error if user is not authorized to delete account', async () => {
      const res = await request(server)
        .delete(`/api/users/${user._id}`)
        .send({ userId: 'wronguserid' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toBe(
        'You can only delete your account!'
      );
    });
  });

  // GET user friends
  describe('GET user friends', () => {
    let user;

    beforeAll(async () => {
      user = await User.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
      });
    });

    afterAll(async () => {
      await User.deleteMany();
    });

    it('responds with a list of friends when given a valid user ID', async () => {
      const friend1 = await User.create({
        username: 'friend1',
        password: 'testpassword',
        email: 'friend1@example.com',
        profilePicture: 'image1.jpeg',
      });
      const friend2 = await User.create({
        username: 'friend2',
        password: 'testpassword',
        email: 'friend2@example.com',
        profilePicture: 'image2.jpeg',
      });
      const friend3 = await User.create({
        username: 'friend3',
        password: 'testpassword',
        email: 'friend3@example.com',
        profilePicture: 'image3.jpeg',
      });

      user.followings = [
        friend1._id,
        friend2._id,
        friend3._id,
      ];
      await user.save();

      const res = await request(server).get(
        `/api/users/friends/${user._id}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([
        {
          _id: friend1._id.toString(),
          username: 'friend1',
          profilePicture: 'image1.jpeg',
        },
        {
          _id: friend2._id.toString(),
          username: 'friend2',
          profilePicture: 'image2.jpeg',
        },
        {
          _id: friend3._id.toString(),
          username: 'friend3',
          profilePicture: 'image3.jpeg',
        },
      ]);
    });

    it('responds with a 500 status code when given an invalid user ID', async () => {
      const res = await request(server).get(
        '/api/users/friends/123'
      );
      expect(res.statusCode).toBe(500);
    });
  });

  // Follow a user
  describe('Follow a user', () => {
    let user;
    let currentUser;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
      });

      currentUser = await User.create({
        username: 'testuser2',
        password: 'testpassword',
        email: 'testuser2@example.com',
      });
    });

    afterEach(async () => {
      await User.deleteMany();
    });

    it('should follow a user successfully', async () => {
      const res = await request(server)
        .put(`/api/users/${user._id}/follow`)
        .send({ userId: currentUser._id });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('User has been followed');

      const updatedUser = await User.findById(user._id);
      const updatedCurrentUser = await User.findById(
        currentUser._id
      );

      expect(updatedUser.followers).toContain(
        currentUser._id.toString()
      );
      expect(updatedCurrentUser.followings).toContain(
        user._id.toString()
      );
    });

    it('should return 403 if user is already followed', async () => {
      user.followers.push(currentUser._id);
      await user.save();

      const res = await request(server)
        .put(`/api/users/${user._id}/follow`)
        .send({ userId: currentUser._id });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBe('You already follow this user');
    });

    it('should return 403 if trying to follow oneself', async () => {
      const res = await request(server)
        .put(`/api/users/${user._id}/follow`)
        .send({ userId: user._id });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBe('You cant follow yourself');
    });

    it('should return 500 on server error', async () => {
      jest
        .spyOn(User, 'findById')
        .mockImplementation(() => {
          throw new Error('Mock Error');
        });

      const res = await request(server)
        .put(`/api/users/${user._id}/follow`)
        .send({ userId: currentUser._id });

      expect(res.statusCode).toBe(500);
    });
  });

  // Unfollow a user
  describe('Unfollow a user', () => {
    let user;
    let currentUser;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com',
        followers: ['612d8107cbfa6d1b6c237c72'],
      });

      currentUser = await User.create({
        username: 'testuser2',
        password: 'testpassword',
        email: 'testuser2@example.com',
        followings: ['612d8107cbfa6d1b6c237c72'],
      });
    });

    afterEach(async () => {
      await User.deleteMany();
    });

    it('should unfollow a user successfully', async () => {
      const res = await request(server)
        .put(`/api/users/${user._id}/unfollow`)
        .send({ userId: currentUser._id });

      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('User has been unfollowed');

      const updatedUser = await User.findById(user._id);
      const updatedCurrentUser = await User.findById(
        currentUser._id
      );

      expect(updatedUser.followers).not.toContain(
        currentUser._id.toString()
      );

      expect(updatedCurrentUser.followings).not.toContain(
        user._id.toString()
      );
    });

    it('should return 403 if user is not being followed', async () => {
      const res = await request(server)
        .put(`/api/users/${user._id}/unfollow`)
        .send({ userId: currentUser._id });

      expect(res.statusCode).toBe(403);
      expect(res.body).toBe('You dont follow this user');

      const updatedUser = await User.findById(user._id);
      const updatedCurrentUser = await User.findById(
        currentUser._id
      );

      expect(updatedUser.followers).toContain(
        currentUser._id.toString()
      );
      expect(updatedCurrentUser.followings).toContain(
        user._id.toString()
      );
    });
  });
});
