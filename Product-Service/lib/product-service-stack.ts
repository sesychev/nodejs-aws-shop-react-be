import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
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

    // task-4: Create tables
    const products_table = new Table(this, 'PRODUCTS', {
      tableName: 'PRODUCTS',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const stocks_table = new Table(this, 'STOCKS', {
      tableName: 'STOCKS',
      partitionKey: { name: 'product_id', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
    })

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
/*
//Add one item to the table.
private product = (index: number) => {
return {
  id: { S: `${products[index].id}` },
  title: { S: `${products[index].title}` },
  description: { S: `${products[index].description}` },
  price: { N: `${products[index].price}` }
};
}
new AwsCustomResource(this, 'AwsCustomResource_test', {
onCreate: {
  service: 'DynamoDB',
  action: 'putItem',
  parameters: {
    TableName: products_table.tableName,
    Item: this.product(0),
  },
  physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
},
policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: [products_table.tableArn] }),
});
*/
