import request from 'supertest';

describe('app', function() {
  it("should be importable", async function() {
    // All the other tests import it outside of a test. In that case if
    // there is an error then jest doesn't catch that well.
    const app = require('app/app');
  });
});

describe.skip('records', function() {
  const app = require('app/app').default;
  let server = null;
  beforeAll(async function() {
    server = app.listen();
  });
  afterAll(() => server.close());

/*
 * This function is deprecated
  it('should return json', async function() {
    const response = await request(server)
          .get("/eol_api/search/1.0.json?page=1&q=aphis")
          .expect('Content-Type', /json/)
          .expect(200);
  });
  */
});
