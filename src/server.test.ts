import express, { Express } from 'express';
import { setupApp } from './setupServer';
import request, { SuperTest } from 'supertest';

describe('server', () => {
  let app: Express;
  let supertest: SuperTest<request.Test>;

  describe('/search', () => {
    it('finds existing summoner', async () => {
      const res = await supertest
        .get('/search?summoner=playmoredota')
        .expect(200);
    }, 20000);

    it('errors when no summoner is found', async () => {
      const name = 'idontexistpleasedontexist';
      const res = await supertest.get(`/search?summoner=${name}`);
      expect(res).toHaveProperty('statusCode', 500);
    });
  });

  beforeAll(() => {
    app = express();
    setupApp(app);
    supertest = request(app);
  });
});
