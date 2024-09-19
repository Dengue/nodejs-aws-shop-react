#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { StaticSite } from './site-bucket';

const app = new cdk.App();
new StaticSite(app, 'GIRAPHS-v2-StaticSite');
