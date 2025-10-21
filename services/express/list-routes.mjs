import { app } from './server.js';

console.log(
  Object.values(app._router.stack)
    .filter(r => r.route)
    .map(r => r.route.path)
);
