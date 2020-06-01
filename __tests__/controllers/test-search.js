import request from 'supertest';


import app from 'app/app';

describe('Search', function() {
  let server = null;
  beforeAll(async function() {
    server = app.listen();
  });
  afterAll(() => server.close());

  describe.skip('search', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/search")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });

});
