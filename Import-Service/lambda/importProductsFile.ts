import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { header } from "../headers/headers";
import buildResponseBody from "../errors/errors";
import { BUCKET } from "../lib/import-service-stack";

const REGION = 'eu-west-1';

const handler = async (event: any) => {
  const pathProducts = event.queryStringParameters.name;
  console.log(`Input file: ${pathProducts}.`);

  if (!pathProducts.endsWith('.csv')) {
    console.log(`Error with .csv extension for "${pathProducts}" file.`)
    return buildResponseBody(400, header, JSON.stringify(`The file format is invalid.`, null, 2));
  }
  const KEY = `uploaded/${pathProducts}`;

  const params = {
    Bucket: BUCKET,
    Key: KEY,
    ContentType: 'text/csv',
  };

  const client = new S3Client({ region: REGION })
  const command = new PutObjectCommand(params);

  try {
    await client.send(command)

    const url = await getSignedUrl(client, command);

    console.log('Successfully uploaded data to: ' + BUCKET + '/' + KEY)

    return buildResponseBody(200, header, url);
  } catch (error: any) {
    console.error(error);

    return buildResponseBody(500, header, error.message || JSON.stringify('RS School Server error.', null, 2));
  }
};

export { handler, REGION }