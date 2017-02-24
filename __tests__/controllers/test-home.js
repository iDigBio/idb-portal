import request from 'supertest';


import app from 'app/app';

describe('Home', function() {
  let server = null;
  beforeAll(async function() {
    server = app.listen();
  });
  afterAll(() => server.close());

  describe('index', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });

});