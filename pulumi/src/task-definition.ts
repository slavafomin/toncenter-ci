
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

import { executionRole, taskRole } from './task-roles';
import { appName, awsRegion } from './common/config';


//===========//
// LOG GROUP //
//===========//

const logGroupName = appName;

const logGroup = (
  new aws.cloudwatch.LogGroup(appName, {
    name: logGroupName,
    retentionInDays: 90,
  })
);


//=================//
// TASK DEFINITION //
//=================//

// https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html
export const taskDefinition = (
  new awsx.ecs.FargateTaskDefinition(appName, {
    family: appName,
    cpu: '2048',
    memory: '8192',
    taskRole,
    executionRole,
    container: {
      image: 'toncenter/ton-http-api',
      entryPoint: ['gunicorn'],
      command: [
        '-k', 'uvicorn.workers.UvicornWorker',
        '-w', '1',
        '--bind', '0.0.0.0:80',
        'pyTON.main:app'
      ],
      essential: true,
      portMappings: [
        { containerPort: 80 },
      ],
      environment: [
        {
          name: 'TON_API_LOGS_LEVEL',
          value: 'WARNING',
        },
      ],

      // https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_LogConfiguration.html
      logConfiguration: {
        logDriver: 'awslogs',
        options: {
          // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html
          'awslogs-group': logGroupName,
          'awslogs-create-group': 'true',
          'awslogs-region': awsRegion,
          'awslogs-stream-prefix': appName,
        },
      },

    },

    logGroup,

  })
);
