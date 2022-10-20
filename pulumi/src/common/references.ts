
import { Vpc } from '@pulumi/aws/ec2';
import { Cluster } from '@pulumi/awsx/ecs';
import { ID, Output, StackReference } from '@pulumi/pulumi';

import { commonStackPath } from './config';


export const stageCommonStack = (
  new StackReference(commonStackPath)
);

export const commonVpc = <Output<Vpc>> (
  stageCommonStack.requireOutput('commonVpc')
);

export const privateSubnetIds = <Output<string[]>> (
  stageCommonStack.requireOutput('privateSubnetIds')
);

export const commonCluster = <Output<Cluster>> (
  stageCommonStack.requireOutput('commonCluster')
);

export const commonPrivateDnsNamespaceId = <Output<ID>> (
  stageCommonStack.requireOutput('commonPrivateDnsNamespaceId')
);
