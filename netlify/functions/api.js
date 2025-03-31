// netlify/functions/api.js
const serverless = require('serverless-http');
// Adjust the path based on your project structure to import the Express app
// Assuming netlify/functions is at the root level alongside src/
const app = require('../../src/server/index');

// Wrap the app with serverless-http
const handler = serverless(app);

// Export the handler for Netlify
module.exports.handler = async (event, context) => {
  // You can add custom logic here before or after the handler runs if needed
  const result = await handler(event, context);
  // You can add custom logic here based on the result if needed
  return result;
};
