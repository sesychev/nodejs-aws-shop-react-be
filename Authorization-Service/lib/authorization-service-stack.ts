import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizer = new NodejsFunction(this, 'basicAuthorizerFunction', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'basicAuthorizer',
      entry: 'lambda/basicAuthorizer.ts',
    })

    new CfnOutput(this, 'AuthorizationService', {
      value: basicAuthorizer.functionArn,
      description: '',
    });
  }
}
