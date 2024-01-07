import { header } from "../headers/headers";
import { DatabaseConnectionError } from "../errors/errors";
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const handler = async (event: any) => {
  try {
    const client = new DocumentClient();

    const body = JSON.parse(event.body);
    const check =
      body &&
      body.hasOwnProperty('title') &&
      body.hasOwnProperty('description') &&
      body.hasOwnProperty('price') &&
      body.hasOwnProperty('count');

    if (!check) {
      return {
        statusCode: 400,
        headers: header,
        body: JSON.stringify('Product data is invalid', null, 2),
        'isBase64Encoded': false
      };
    };

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

    await client.transactWrite(
      {
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
      },
    ).promise();

    return {
      statusCode: 200,
      headers: header,
      body: JSON.stringify('Product is created', null, 2),
      'isBase64Encoded': false
    };
  } catch (error: any) {
    throw new DatabaseConnectionError(error);
  }
};

