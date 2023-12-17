import { fromEnv } from '@aws-sdk/credential-provider-env';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { header } from '../headers/headers';
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const handler = async (event: { Records: { body: any; }[]; }) => {
  const credentials = fromEnv();
  const client = new SNSClient({ credentials });
  const clientDB = new DocumentClient();

  try {
    const products = event.Records.map(({ body }) => body);
    console.log('records:', products);

    for (const item of products) {
      const body = JSON.parse(item);
      console.log('body:', body);

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

      const id = uuidv4();

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

      console.log('new-product:', JSON.stringify({ ...product, ...stock }));

      await clientDB.transactWrite(
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

      try {
        const params = {
          Subject: 'No subject',
          Message: JSON.stringify({ ...product, ...stock }),
          TopicArn: 'arn:aws:sns:eu-west-1:675448858320:Topic',
          MessageAttributes: {
            count: {
              DataType: 'Number',
              StringValue: body.count,
            },
          },
        };

        const command = new PublishCommand(params);

        client.send(command, (error) => {
          if (error) console.log('SNS publish failed:', error.stack);
        });

        console.log('SNS published successfully.');

      } catch (error) {
        console.log(error);
      }
    }

    return { statusCode: 200 };
  } catch (error) {

    return { statusCode: 500 };
  }
};