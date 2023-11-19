import { Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const httpApi = new HttpApi(this, 'ProductServiceApi', {
      description: 'Product Service API',
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: [CorsHttpMethod.ANY],
        allowCredentials: false,
        allowOrigins: ['*'],
      },
    });

    const getProductsList = new NodejsFunction(this, 'getProductsList', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'getProductsList',
      entry: 'lambda/getProductsList.ts',
      handler: "handler",
    })

    const getProductsById = new NodejsFunction(this, 'getProductsById', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'getProductsById',
      entry: 'lambda/getProductsById.ts',
      handler: "handler",
    })

    httpApi.addRoutes({
      path: '/products',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'get-products-integration',
        getProductsList,
      ),
    });

    httpApi.addRoutes({
      path: '/products/{productId}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'get-productsId-integration',
        getProductsById,
      ),
    });
  }
}
