import { ALLOW, DENY, UNAUTHORIZED } from './constants';
import path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

export const handler = (event: any, _context: any, callback: any) => {
  console.log('event:', event);

  if (!event.authorizationToken) callback(UNAUTHORIZED);

  try {
    const authorizationToken = event.authorizationToken;
    console.log('client token:', event.authorizationToken);

    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    const [user, password] = buff.split(':');

    console.log('userName:', user);
    console.log('password:', password);

    //const storedUserPassword = process.env.user;
    console.log(process.env.user);
    const storedUserPassword = (user === 'sesychev') ? 'TEST_PASSWORD' : '';
    console.log('storedUserPassword:', storedUserPassword);

    const effect = user && password && storedUserPassword === password ? ALLOW : DENY;
    console.log('effect:', JSON.stringify(effect));

    const policy = generatePolicy(encodedCreds, effect, event.methodArn);
    console.log('policy:', JSON.stringify(policy));

    callback(null, policy);
  } catch (error) {
    console.log('error:', error);

    callback('Error: Invalid token.');
  }
};

const generatePolicy = (
  principalId: any,
  Effect: string,
  Resource: any
) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect,
        Resource
      }
    ]
  }
});

