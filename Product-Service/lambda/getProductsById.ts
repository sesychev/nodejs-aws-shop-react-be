import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { NotFoundError, ValidationError } from '../errors/errors';
import { header } from '../headers/headers';
//import { products } from '../mocks/data';
//import { Product } from '../models/Product';

export const handler = async (event: any) => {
	try {
		//const product = products.find((prod: Product) => prod.id === event.pathParameters.productId);
		const id = event.pathParameters.productId;
		if (!id) throw new ValidationError('Product data is invalid');
		const product = getProductsById(id);
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

async function getProductsById(id: any) {
	const client = new DynamoDBClient({});
	const docClient = DynamoDBDocumentClient.from(client);

	const productsDB = await docClient.send(
		new GetCommand({
			TableName: 'PRODUCTS',
			Key: {
				id: `${id}`,
			},
		}));

	if (productsDB.Item === undefined) throw new NotFoundError(`Product ${id} not found`);

	console.log(productsDB.Item)

	const stocksDB = await docClient.send(
		new GetCommand({
			TableName: 'STOCKS',
			Key: {
				product_id: `${id}`,
			},
		}));

	console.log(stocksDB.Item)

	return {
		id: productsDB.Item.id,
		count: stocksDB.Item?.count,
		title: productsDB.Item.title,
		description: productsDB.Item.description,
		price: productsDB.Item.price,
	};
};