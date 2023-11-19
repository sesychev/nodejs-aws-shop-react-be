import { header } from '../headers/headers';
import { products } from '../mocks/data';

export const handler = async () => {
	try {
		return {
			statusCode: 200,
			headers: header,
			body: JSON.stringify(products, null, 2),
			"isBase64Encoded": false
		};
	} catch (error: any) {
		return {
			statusCode: error.statusCode || 500,
			body: JSON.stringify(`Bad Request: You submitted invalid input: ${error.message}`),
			"isBase64Encoded": false
		};
	}
};