
import * as pulumi from '@pulumi/pulumi';


const awsConfig = new pulumi.Config('aws');

export const awsRegion = awsConfig.require('region');


const appConfig = new pulumi.Config('app');

export const commonStackPath = (appConfig
  .require('commonStackPath')
);

export const appName = (appConfig
  .require('appName')
);

export const awsAccountId = (appConfig
  .require('awsAccountId')
);

export const ingressSGIds = (appConfig
  .requireObject<string[]>('ingressSGIds')
);

export const instancesCount = (appConfig
  .requireNumber('instancesCount')
);
