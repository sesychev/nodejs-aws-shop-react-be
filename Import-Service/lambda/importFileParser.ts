import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import buildResponseBody from '../errors/errors';
import { header } from '../headers/headers';
import { Readable } from 'stream';
import csv = require('csv-parser');
import { REGION } from './importProductsFile';
import { SQSClient, SendMessageBatchCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { fromEnv } from '@aws-sdk/credential-provider-env';

export const handler = async (event: { Records: any; }) => {
  //console.log(`${JSON.stringify(event)}`);
  console.log(event);

  //for (const record of event.Records) {
  const KEY = event.Records[0].s3.object.key;
  const BUCKET = event.Records[0].s3.bucket.name;

  const params = {
    Bucket: BUCKET,
    Key: KEY,
  };

  const client = new S3Client({ region: REGION })
  const command = new GetObjectCommand(params);

  const credentials = fromEnv();
  const clientSQS = new SQSClient({ credentials });

  try {
    const item = await client.send(command)

    await new Promise(() => {
      const body = item.Body;
      const batch: any[] = [];

      if (body instanceof Readable) {
        body
          .pipe(csv())
          .on('data', async (data: any) => {
            console.log(`Record: ${JSON.stringify(data)}.`);
            batch.push(data);
          })
          .on('end', async () => {
            console.log('CSV file is parsed.');

            try {
              const params = {
                QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/675448858320/Queue',
                Entries: batch.map((message, index) => ({
                  Id: String(index),
                  MessageBody: JSON.stringify(message)
                }))
              };

              await clientSQS.send(new SendMessageBatchCommand(params));

              console.log('SQS batch messages have been sent.');

              await client.send(new CopyObjectCommand({
                Bucket: BUCKET,
                CopySource: BUCKET + '/' + KEY,
                Key: KEY.replace('uploaded', 'parsed'),
              }))

              console.log(`CopyObjectCommand is done.`);

              await client.send(new DeleteObjectCommand({
                Bucket: BUCKET,
                Key: KEY,
              }))

              console.log(`DeleteObjectCommand is done.`);
            } catch (error) {
              console.log(error);
            }
          })
          .on('error', (error: any) => console.log(`Error: ${error}.`));
      }
      else {
        console.log('File error.')
      }
    });

    return buildResponseBody(200, header, JSON.stringify('Successfully parsed.', null, 2));
  } catch (error: any) {
    console.log(error);

    return buildResponseBody(500, header, error.message || JSON.stringify('RS School Server error.', null, 2));
  }
};
//}
