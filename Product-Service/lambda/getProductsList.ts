import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { header } from '../headers/headers';
//import { Product, Stock, StockProduct } from '../types/types';
//import { products } from '../mocks/data';

export const handler = async () => {
	try {
		const products = await ProductsList()
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

async function ProductsList() {
	const client = new DynamoDBClient({});
	const docClient = DynamoDBDocumentClient.from(client);

	const productsDB = await docClient.send(
		new ScanCommand({
			TableName: 'PRODUCTS',
		}));

	console.log(productsDB.Items)

	const stocksDB = await docClient.send(
		new ScanCommand({
			TableName: 'STOCKS',
		}));

	console.log(stocksDB.Items)

	const result = productsDB.Items?.map((data) => {
		return {
			id: data.id,
			count: stocksDB.Items?.find((stock) => stock.id === data.id)?.count,
			title: data.title,
			description: data.description,
			price: data.price,
		};
	});

	console.log(result);

	return result;
}