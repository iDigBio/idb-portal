import request from 'supertest';


import app from 'app/app';

describe('Publishers', function() {
  let server = null;
  beforeAll(async function() {
    server = app.listen();
  });
  afterAll(() => server.close());

  describe('publishers', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/publishers")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });

  describe('recordset', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/recordsets/137ed4cd-5172-45a5-acdb-8e1de9a64e32")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });
  describe('collections', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/collections/")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });
  describe('collection', function() {
    it('should return html', async function() {
      const response = await request(server)
            .get("/collections/7b7fa352-b307-11e4-b3ee-002315492bbc")
            .expect('Content-Type', /html/)
            .expect(200);
    });

  });  

});
