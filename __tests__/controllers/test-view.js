import request from 'supertest';


import app from 'app/app';

describe('View', function() {
  let server = null;
  beforeAll(async function() {
    server = app.listen();
  });
  afterAll(() => server.close());

  describe('mediarecords', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/mediarecords/dc4775a3-b6ef-431a-9900-6f16d64854fb")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });

  describe('records', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/records/a7b9b5e1-1dfa-48d1-a286-68a17486880a")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });  

});
