const { Express, Logger } = require('@hmcts/nodejs-logging');

import * as bodyParser from 'body-parser';
import config = require('config');
import cookieParser from 'cookie-parser';
import express from 'express';
import { Helmet } from './modules/helmet';
import * as path from 'path';
import { RouterFinder } from 'router/routerFinder';
import { HTTPError } from 'HttpError';
const { setupDev } = require('./development');
const redis = require('redis');
const healthcheck = require('routes/health');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const redisClient = redis.createClient({host : 'localhost', port : REDIS_PORT});

redisClient.on('connect', function(){
  console.log('connected to redis server');
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('error', () => {
  console.log('Error in Redis');
});

export const app = express();
app.locals.ENV = env;

app.use(Express.accessLogger());

const logger = Logger.getLogger('app');

// secure the application by adding various HTTP headers to its responses
new Helmet(config.get('security')).enableFor(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});
app.use('/', RouterFinder.findAll(path.join(__dirname, 'routes')));
setupDev(app,developmentMode);

app.use((req, res) => {
  res.status(404);
  res.send('not-found');
});

app.use((err: HTTPError, req: express.Request, res: express.Response) => {
  logger.error(`${err.stack || err}`);

  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};
  res.status(err.status || 500);
  res.send('error');
});

app.use('/health', healthcheck);
