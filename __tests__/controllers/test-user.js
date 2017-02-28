import request from 'supertest';


import app from 'app/app';

describe('User', function() {
  let server = null;
  beforeAll(async function() {
    server = app.listen();
  });
  afterAll(() => server.close());

  describe('login', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/login")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });

});
