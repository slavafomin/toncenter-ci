
import * as aws from '@pulumi/aws';
import { PolicyDocument } from '@pulumi/aws/iam';
import * as pulumi from '@pulumi/pulumi';

import { appName, awsAccountId, awsRegion } from './common/config';


const assumeRolePolicy: pulumi.Input<string | PolicyDocument> = {
  Version: '2012-10-17',
  Statement: [{
    Principal: {
      Service: 'ecs-tasks.amazonaws.com',
    },
    Action: 'sts:AssumeRole',
    Effect: 'Allow',
  }],
};

const executionRolePolicy = {
  'Statement': [
    {
      'Sid': 'Logging',
      'Effect': 'Allow',
      'Resource': [
        `arn:aws:logs:${awsRegion}:${awsAccountId}:log-group:${appName}:*`,
      ],
      'Action': [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
      ],
    },
  ],
  'Version': '2012-10-17',
};

export const executionRole = (
  new aws.iam.Role(`${appName}-execution`, {
    name: `${appName}-execution`,
    assumeRolePolicy,
    inlinePolicies: [{
      name: `${appName}-execution-policy`,
      policy: JSON.stringify(executionRolePolicy, null, 4),
    }],
  })
);

export const taskRole = (
  new aws.iam.Role(`${appName}-task`, {
    name: `${appName}-task`,
    assumeRolePolicy,
  })
);
