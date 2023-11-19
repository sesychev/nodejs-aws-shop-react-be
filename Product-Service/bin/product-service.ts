#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';

const app = new App();

new ProductServiceStack(app, 'ProductServiceStack', {});

app.synth();