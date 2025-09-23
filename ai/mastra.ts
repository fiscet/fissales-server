import { Mastra } from '@mastra/core/mastra';
import { type LogLevel, PinoLogger } from '@mastra/loggers';
import { storage } from './utils/storage.js';
import { frontendAgent } from './agents/frontend-agent/index.js';
import { presalesAgent } from './agents/presales-agent.js';
import { salesAgent } from './agents/sales-agent.js';
import { mainNetwork } from './networks/main-network.js';
import { salesFunnelWorkflow } from './workflows/sales-funnel-workflow.js';

let mastraInstance: Mastra | null = null;

export async function initializeMastra(): Promise<Mastra> {
  if (mastraInstance) {
    return mastraInstance;
  }

  mastraInstance = new Mastra({
    agents: {
      frontendAgent,
      presalesAgent,
      salesAgent
    },
    workflows: {
      salesFunnelWorkflow
    },
    vnext_networks: { mainNetwork },
    logger: new PinoLogger({
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      name: 'logs/mastra.log'
    }),
    storage
  });

  return mastraInstance;
}

export async function getMastra(): Promise<Mastra> {
  return mastraInstance || (await initializeMastra());
}
