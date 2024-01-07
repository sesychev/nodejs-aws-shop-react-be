#!/usr/bin/env node
import 'source-map-support/register';
import { ImportServiceStack } from '../lib/import-service-stack';
import { App } from 'aws-cdk-lib';

const app = new App();

new ImportServiceStack(app, 'ImportServiceStack', {});

app.synth();