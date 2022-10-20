
import * as aws from '@pulumi/aws';

import { taskDefinition } from './task-definition';

import {
  appName,
  ingressSGIds,
  instancesCount,

} from './common/config';

import {
  commonCluster,
  commonPrivateDnsNamespaceId,
  commonVpc,
  privateSubnetIds,

} from './common/references';


const securityGroup = (
  new aws.ec2.SecurityGroup(appName, {
    name: appName,
    description: `Service ${appName} security group`,
    vpcId: commonVpc.id,
    ingress: [
      {
        fromPort: 0,
        toPort: 0,
        protocol: "-1",
        securityGroups: ingressSGIds,
      }
    ],
    // @todo harden this
    egress: [{
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidrBlocks: ["0.0.0.0/0"],
      ipv6CidrBlocks: ["::/0"],
    }],
  })
);

const discoveryService = (
  new aws.servicediscovery.Service(appName, {
    name: appName,
    dnsConfig: {
      namespaceId: commonPrivateDnsNamespaceId,
      dnsRecords: [{
        ttl: 10,
        type: 'A',
      }],
      routingPolicy: 'MULTIVALUE',
    },
    healthCheckCustomConfig: {
      failureThreshold: 3,
    },
  })
);

export const service = new aws.ecs.Service(appName, {
  name: appName,
  cluster: commonCluster.cluster.arn,
  deploymentMaximumPercent: 200,
  deploymentMinimumHealthyPercent: 100,
  desiredCount: instancesCount,
  networkConfiguration: {
    securityGroups: [
      securityGroup.id,
    ],
    subnets: privateSubnetIds,
  },
  taskDefinition: taskDefinition.taskDefinition.arn,
  serviceRegistries: {
    registryArn: discoveryService.arn,
  },
  capacityProviderStrategies: [
    {
      capacityProvider: 'FARGATE',
      base: 1,
      weight: 0,
    },
    {
      capacityProvider: 'FARGATE_SPOT',
      weight: 100,
    }
  ],
}, {
  ignoreChanges: [
    'taskDefinition',
  ],
});
