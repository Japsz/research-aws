import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { PGHOST, PGPASSWORD, PGUSER, vpcEnv } from './constants';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';

import * as rds from 'aws-cdk-lib/aws-rds';

export class ResearchAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = ec2.Vpc.fromLookup(this, 'ResearchAwsVpc', {
      vpcId: vpcEnv
    });

    // Create a security group for the RDS instance
    const rdsSecurityGroup = new ec2.SecurityGroup(this, 'ResearchAwsRdsSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'ResearchAwsRdsSecurityGroup'
    });

    // Allow access to the RDS instance from the lambdas
    rdsSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(5432), 'Allow access from VPC');

    // Create the RDS instance
    const rdsInstance = rds.DatabaseInstance.fromDatabaseInstanceAttributes(this, 'ResearchAwsRdsInstance', {
      instanceEndpointAddress: PGHOST,
      instanceIdentifier: 'connection-testing',
      port: 5432,
      securityGroups: [rdsSecurityGroup],
      instanceResourceId: 'connection-testing',
    });

    // ...

    // A layerless lambda function
    const layerless = new NodejsFunction(this, 'ResearchAwsLayerlessFunction', {
      entry: 'services/layerless/index.ts',
      handler: 'handler',
      vpc,
      allowPublicSubnet: true,
      environment: {
        PGUSER,
        PGHOST: rdsInstance.dbInstanceEndpointAddress,
        PGPASSWORD
      },
      timeout: cdk.Duration.seconds(30),
    });



    // A lambda function with a layer
    const layer = new LayerVersion(this, 'ResearchAwsLayer', {
      code: Code.fromAsset('services/layer/dist/db'),
      compatibleRuntimes: [Runtime.NODEJS_18_X],
      description: 'A layer for the Research AWS project',
      license: 'MIT',
      layerVersionName: 'ResearchAwsLayer',
    });
    const layered = new NodejsFunction(this, 'ResearchAwsLayeredFunction', {
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
        PGHOST: rdsInstance.dbInstanceEndpointAddress,
        PGPASSWORD
      },
      timeout: cdk.Duration.seconds(30)
    });
    // grant the lambda function access to the RDS instance
    rdsInstance.grantConnect(layerless, PGUSER);
    rdsInstance.grantConnect(layered, PGUSER);
  }
}
