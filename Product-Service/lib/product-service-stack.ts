import { CfnOutput, CfnParameter, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { products, stocks } from '../mocks/data';
import { Product, Stock } from '../types/types';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Subscription, SubscriptionFilter, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

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

    const createProduct = new NodejsFunction(this, 'createProduct', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'createProduct',
      entry: 'lambda/createProduct.ts',
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
      path: '/products',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        'post-products-integration',
        createProduct,
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

    // task-4: Create tables
    const products_table = new Table(this, 'PRODUCTS', {
      tableName: 'PRODUCTS',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    products_table.grantReadData(getProductsList);
    products_table.grantReadData(getProductsById);
    products_table.grantReadWriteData(createProduct)

    const stocks_table = new Table(this, 'STOCKS', {
      tableName: 'STOCKS',
      partitionKey: { name: 'product_id', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    stocks_table.grantReadData(getProductsList);
    stocks_table.grantReadData(getProductsById);
    stocks_table.grantReadWriteData(createProduct)

    // task-4: Loading Table Data
    new AwsCustomResource(this, 'AwsCustomResourceProducts', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [products_table.tableName]: this.generateBatchProducts(products),
          },
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: [products_table.tableArn] }),
    });

    new AwsCustomResource(this, 'AwsCustomResourceStocks', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [stocks_table.tableName]: this.generateBatchStoks(stocks),
          },
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: [stocks_table.tableArn] }),
    });

    // task-4: Outputs
    new CfnOutput(this, 'ProductsTable', {
      value: products_table.tableName,
      description: 'Creating two databases tables in DynamoDB',
      exportName: 'Products',
    });

    new CfnOutput(this, 'StocksTable', {
      value: stocks_table.tableName,
      description: 'Creating two databases tables in DynamoDB',
      exportName: 'Stocks',
    });

    // task-6:
    const queue = new Queue(this, 'catalogItemsQueue', {
      queueName: 'Queue',
    });

    const topic = new Topic(this, 'createProductTopic', {
      displayName: 'SNS topic',
      topicName: 'Topic',
    });

    const moreEmail = new CfnParameter(this, "subscriptionMore");//

    topic.addSubscription(
      new EmailSubscription(moreEmail.value.toString(), {
        filterPolicy: {
          count: SubscriptionFilter.numericFilter({
            greaterThanOrEqualTo: 10,
          }),
        }
      })
    );

    const lessEmail = new CfnParameter(this, "subscriptionLess");//

    topic.addSubscription(
      new EmailSubscription(lessEmail.value.toString(), {
        filterPolicy: {
          count: SubscriptionFilter.numericFilter({
            lessThan: 10,
          }),
        }
      })
    );

    const catalogBatchProcess = new NodejsFunction(this, 'catalogBatchProcess',
      {
        runtime: Runtime.NODEJS_18_X,
        functionName: 'catalogBatchProcess',
        entry: 'lambda/catalogBatchProcess.ts',
        handler: 'handler',
      }
    );

    products_table.grantWriteData(catalogBatchProcess);
    stocks_table.grantWriteData(catalogBatchProcess);
    topic.grantPublish(catalogBatchProcess);

    catalogBatchProcess.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 5,
      })
    );

    new CfnOutput(this, 'TopicArn', {
      value: topic.topicArn,
      description: 'The arn of the SNS topic',
    });

    new CfnOutput(this, 'QueueArn', {
      value: queue.queueUrl,
      description: 'The URL of the SQS topic',
    });
    //the end
  }

  private product = (item: Product) => {
    return {
      id: { S: `${item.id}` },
      title: { S: `${item.title}` },
      description: { S: `${item.description}` },
      price: { N: `${item.price}` }
    };
  }

  private stock = (item: Stock) => {
    return {
      product_id: { S: `${item.id}` },
      count: { N: `${item.count}` }
    };
  }

  private generateBatchProducts = (items: any[]) => {
    const records: any[] = [];
    items.forEach((item) => {
      records.push({ PutRequest: { Item: this.product(item) } })
    }
    );
    return records;
  }

  private generateBatchStoks = (items: any[]) => {
    const records: any[] = [];
    items.forEach((item) => {
      records.push({ PutRequest: { Item: this.stock(item) } })
    }
    );
    return records;
  }
}
