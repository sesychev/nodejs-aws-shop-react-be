import { ALLOW, DENY, UNAUTHORIZED } from './constants';

export const handler = (event: any, _context: any, callback: any) => {
  console.log('event:', event);

  //if (!event.type || event.type !== 'TOKEN') callback('Error: Invalid token.');

  try {
    const authorizationToken = event.authorizationToken;
    console.log('client token:', event.authorizationToken);

    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    const [user, password] = buff.split(':');

    console.log('password:', password);
    console.log('userName:', user);

    const storedUserPassword = process.env[user];

    const effect = !storedUserPassword || storedUserPassword !== password ? DENY : ALLOW;
    console.log('effect:', JSON.stringify(effect));

    const policy = generatePolicy(encodedCreds, effect, event.methodArn);
    console.log('policy:', JSON.stringify(policy));

    callback(null, policy);
  } catch (error) {
    console.log('error:', error);

    callback(UNAUTHORIZED, error);
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

