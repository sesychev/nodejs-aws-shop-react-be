import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps, aws_apigateway } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { BlockPublicAccess, Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { LambdaIntegration, ResponseType, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export const BUCKET = 'uploaded-rschool-bucket';

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'UploadBucket',
      {
        bucketName: BUCKET,
        // Setting up CORS
        cors: [
          {
            allowedMethods: [
              HttpMethods.GET,
              HttpMethods.PUT,
            ],
            allowedOrigins: ['*'],
            allowedHeaders: ['*'],
          },
        ],
        versioned: true,
        autoDeleteObjects: true,
        publicReadAccess: false,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    const importProductsFile = new NodejsFunction(this, 'ImportProductsFile', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'importProductsFile',
      entry: 'lambda/importProductsFile.ts',
      handler: 'handler',
    })

    const importFileParser = new NodejsFunction(this, 'ImportFileParser', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'importFileParser',
      entry: 'lambda/importFileParser.ts',
      handler: 'handler',
    })

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(importFileParser),
      { prefix: 'uploaded' },
    );

    bucket.grantReadWrite(importProductsFile);
    bucket.grantReadWrite(importFileParser);

    const httpApi = new HttpApi(this, 'ImportServiceApi', {
      description: 'Import Service API',
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: [CorsHttpMethod.ANY],
        allowCredentials: false,
        allowOrigins: ['*'],
      },
    });

    new CfnOutput(this, 'ImportService', {
      value: `${httpApi.url}import`,
      description: '',
    });

    const queue = Queue.fromQueueArn(
      this,
      'catalogItemsQueue',
      'arn:aws:sqs:eu-west-1:675448858320:Queue',
    );

    queue.grantSendMessages(importFileParser);

    //task-7
    const importedLambda = lambda.Function.fromFunctionArn(this, 'fromFunctionArn', 'arn:aws:lambda:eu-west-1:675448858320:function:basicAuthorizer');

    console.log('functionArn', importedLambda.functionArn);
    console.log('functionName', importedLambda.functionName);

    const authorizer = new HttpLambdaAuthorizer('HttpLambdaAuthorizer', importedLambda, {
      responseTypes: [HttpLambdaResponseType.IAM],
      resultsCacheTtl: Duration.seconds(0),
    });

    new lambda.CfnPermission(this, 'CfnPermission', {
      action: 'lambda:InvokeFunction',
      functionName: importedLambda.functionName,
      principal: 'apigateway.amazonaws.com',
      sourceAccount: this.account,
    });

    httpApi.addRoutes({
      path: '/import',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'import-service-integration',
        importProductsFile,
      ),
      authorizer,
    });
  };
};