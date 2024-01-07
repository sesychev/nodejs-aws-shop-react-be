import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand  } from "@aws-sdk/lib-dynamodb";
import { NotFoundError } from '../errors/errors';
import { header } from '../headers/headers';
//import { Product, Stock } from "../types/types";
//import { products, stocks } from '../mocks/data';
//import { Product } from '../models/Product';

export const handler = async (event: any) => {
	try {
		const client = new DynamoDBClient({});
		const docClient = DynamoDBDocumentClient.from(client);

		const productsDB = await docClient.send(
			new GetCommand({
				TableName: 'PRODUCTS',
				Key: { id: event.pathParameters.productId },
			}));

		if (productsDB.Item === undefined) throw new NotFoundError(`Product ${event.pathParameters.productId} not found`);

		console.log(productsDB.Item)

		const stocksDB = await docClient.send(
			new GetCommand({
				TableName: 'STOCKS',
				Key: { product_id: event.pathParameters.productId },
			}));

		console.log(stocksDB.Item)

		const product = {
			id: productsDB.Item?.id,
			count: stocksDB.Item?.count,
			title: productsDB.Item?.title,
			description: productsDB.Item?.description,
			price: productsDB.Item?.price,
		}

		console.log(product)

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