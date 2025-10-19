import { registerAs } from '@nestjs/config';

export default registerAs('cors', () => ({
  origins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['*'],
  methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: process.env.CORS_CREDENTIALS === 'true',
}));
