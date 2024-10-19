import 'dotenv/config';

export default {
  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: `${process.env.DATABASE_NAME}_test`,
    },
  },

  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
  },
};
