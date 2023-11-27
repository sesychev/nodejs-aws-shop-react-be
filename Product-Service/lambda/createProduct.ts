import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { header } from "../headers/headers";
import { DatabaseConnectionError, ValidationError } from "../errors/errors";
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event: any) => {
  try {
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const body = JSON.parse(event.body);
/*
    const check =
      body &&
      body.hasOwnProperty('title') &&
      body.hasOwnProperty('description') &&
      body.hasOwnProperty('price') &&
      body.hasOwnProperty('count');

    if (!check) {
      throw new ValidationError('Product data is invalid');
    }
*/
    const id = uuidv4()

    const product = {
      id: id,
      title: body.title,
      description: body.description,
      price: body.price,
    }

    const stock = {
      product_id: id,
      count: body.count,
    }

    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: 'PRODUCTS',
              Item: product,
            },
          },
          {
            Put: {
              TableName: 'STOCKS',
              Item: stock,
            },
          },
        ],
      }),
    );

    return {
      statusCode: 200,
      headers: header,
      body: JSON.stringify("Product is created", null, 2),
      "isBase64Encoded": false
    };
  } catch (error: any) {
    throw new DatabaseConnectionError(error);
  }
};

