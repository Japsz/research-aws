import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { PGHOST, PGPASSWORD, PGUSER, vpcEnv } from './constants';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';

export class ResearchAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, 'ResearchAwsVpc', {
      vpcId: vpcEnv
    });
    // A layerless lambda function
    new NodejsFunction(this, 'ResearchAwsLayerlessFunction', {
      entry: 'services/layerless/index.ts',
      handler: 'handler',
      vpc,
      allowPublicSubnet: true,
      environment: {
        PGUSER,
        PGHOST,
        PGPASSWORD
      }
    });
    // A lambda function with a layer
    const layer = new LayerVersion(this, 'ResearchAwsLayer', {
      code: Code.fromAsset('services/layer/dist/db'),
      compatibleRuntimes: [Runtime.NODEJS_18_X],
      description: 'A layer for the Research AWS project',
      license: 'MIT',
      layerVersionName: 'ResearchAwsLayer',
    });
    new NodejsFunction(this, 'ResearchAwsLayeredFunction', {
      entry: 'services/layered/index.ts',
      handler: 'handler',
      vpc,
      allowPublicSubnet: true,
      layers: [layer],
      bundling: {
        sourceMap: true,
        externalModules: ['aws-sdk', '/opt/nodejs/db']
      },
      environment: {
        PGUSER,
        PGHOST,
        PGPASSWORD
      }
    });

    
    // example resource
    // const queue = new sqs.Queue(this, 'ResearchAwsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
