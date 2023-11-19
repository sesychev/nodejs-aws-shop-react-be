import { NotFoundError } from '../errors/errors';
import { header } from '../headers/headers';
import { products } from '../mocks/data';
import { Product } from '../models/Product';

export const handler = async (event: any) => {
	try {
		const product = products.find((prod: Product) => prod.id === event.pathParameters.productId);
		if (product === undefined) {
			throw new NotFoundError(`Product ${event.pathParameters.productId} not found`);
		}
		return {
			statusCode: 200,
			headers: header,
			body: JSON.stringify(product, null, 2),
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