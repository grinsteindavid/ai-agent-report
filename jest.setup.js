const { Parameters } = require('./env.json');

const envs = {
  ...Parameters,
  //   // DO NOT CHANGE IT - CRITICAL TO NOT AFFECT PRODUCTION DB
  //   ENVIRONMENT: 'jest-test',
  //   MONGO_URL: '',
  //   // DO NOT CHANGE IT - CRITICAL TO NOT AFFECT PRODUCTION DB
  //   NODE_ENV: 'jest-test',
  //   DEBUG: true,
  //   PORT: 8000,
  //   MAX_RETRIES: 6,
  //   CLUSTER_REGION: '',
  //   CLUSTER_TYPE: 'LOCAL',
  //   SESSION_SECRET: '',
  //   ROLE: 'admin',
  //   REDIS_POOL_SIZE: 15,
  //   SUPER_ADMIN_ID: 'test',
  //   SSO_PRIVATE_CERTS_URL: 'https://test/certs.priv.json',
  //   SSO_PUBLIC_CERTS_URL: 'https://test/certs.json',
  //   SSO_CERT_URL_TOKEN: 'test',
  //   MONGO_DATA_API_URL: 'https://test',
  //   MONGO_DATA_API_KEY: 'test',
};

Object.keys(envs).forEach((key) => {
  process.env[key] = envs[key];
});
