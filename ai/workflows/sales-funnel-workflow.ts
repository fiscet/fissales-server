import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { frontendAgent } from '../agents/frontend-agent/index.js';
import { presalesAgent } from '../agents/presales-agent.js';
import { salesAgent } from '../agents/sales-agent.js';

// Step 1: Frontend Agent - Discovery and Information Gathering
const frontendStep = createStep({
  id: 'frontend-discovery',
  description: 'Gather customer information and understand their needs through conversational discovery',
  inputSchema: z.object({
    customerMessage: z.string().describe('The customer\'s initial message or request'),
    sessionId: z.string().describe('Session identifier for conversation continuity'),
    userId: z.string().optional().describe('User identifier if authenticated')
  }),
  outputSchema: z.object({
    customerProfile: z.object({
      needs: z.string().describe('What the customer needs'),
      timeline: z.string().optional().describe('When they need it'),
      purpose: z.string().optional().describe('What they will use it for'),
      budget: z.string().optional().describe('Budget range if mentioned'),
      preferences: z.array(z.string()).optional().describe('Any specific preferences mentioned')
    }),
    readyForPresales: z.boolean().describe('Whether enough information has been gathered for product research')
  }),
  execute: async ({ inputData, runtimeContext }) => {
    // Set up runtime context for frontend agent
    runtimeContext.set('sessionId', inputData.sessionId);
    runtimeContext.set('userId', inputData.userId || 'anonymous');

    const response = await frontendAgent.generate(inputData.customerMessage, {
      output: z.object({
        timeline: z.string().optional(),
        purpose: z.string().optional(),
        budget: z.string().optional(),
        preferences: z.array(z.string()).optional()
      })
    });

    return {
      customerProfile: {
        needs: inputData.customerMessage,
        ...response.object
      },
      readyForPresales: true // Frontend agent should determine this based on conversation completeness
    };
  }
});

// Step 2: Presales Agent - Product Research and Recommendations
const presalesStep = createStep({
  id: 'presales-research',
  description: 'Research products and create comprehensive recommendations based on customer profile',
  inputSchema: z.object({
    customerProfile: z.object({
      needs: z.string(),
      timeline: z.string().optional(),
      purpose: z.string().optional(),
      budget: z.string().optional(),
      preferences: z.array(z.string()).optional()
    }),
    readyForPresales: z.boolean()
  }),
  outputSchema: z.object({
    recommendedProducts: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      benefits: z.array(z.string()),
      availability: z.string(),
      productUrl: z.string(),
      imageUrl: z.string()
    })).max(5),
    reasoning: z.string().describe('Why these products match customer needs'),
    readyForSales: z.boolean()
  }),
  execute: async ({ inputData, runtimeContext }) => {
    // Set up runtime context for presales agent
    runtimeContext.set('sessionId', inputData.customerProfile.needs);
    runtimeContext.set('userId', 'workflow');

    const response = await presalesAgent.generate(`Please research products for this customer profile: ${JSON.stringify(inputData.customerProfile)}`);


    // Parse the response to extract the structured data
    let recommendedProducts = [];
    let reasoning = '';
    let readyForSales = true;

    try {
      // Extract JSON from markdown code blocks in the response text
      const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response.text;

      const parsed = JSON.parse(jsonString);
      if (parsed.recommendedProducts) {
        // Limit to maximum 5 products
        recommendedProducts = parsed.recommendedProducts.slice(0, 5);
        reasoning = parsed.reasoning || 'Products matched based on customer needs';
        readyForSales = parsed.readyForSales !== false;
      } else {
        // If no products found, return empty array - let the agent handle it
        recommendedProducts = [];
        reasoning = 'No products found matching the criteria';
        readyForSales = false;
      }
    } catch (error) {
      // If JSON parsing fails, return empty - let the agent handle it
      recommendedProducts = [];
      reasoning = 'Failed to parse agent response';
      readyForSales = false;
    }

    return {
      recommendedProducts,
      reasoning,
      readyForSales
    };
  }
});

// Step 3: Sales Agent - Closing the Deal
const salesStep = createStep({
  id: 'sales-closing',
  description: 'Close the sale using Zig Ziglar methodology with personalized approach',
  inputSchema: z.object({
    customerProfile: z.object({
      needs: z.string(),
      timeline: z.string().optional(),
      purpose: z.string().optional(),
      budget: z.string().optional(),
      preferences: z.array(z.string()).optional()
    }),
    recommendedProducts: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      benefits: z.array(z.string()),
      availability: z.string(),
      productUrl: z.string(),
      imageUrl: z.string()
    })).max(5),
    reasoning: z.string(),
    readyForSales: z.boolean()
  }),
  outputSchema: z.object({
    salesResponse: z.string().describe('The sales agent\'s response to close the deal'),
    nextSteps: z.array(z.string()).describe('Recommended next steps for the customer'),
    urgencyLevel: z.enum(['low', 'medium', 'high']).describe('Level of urgency for the purchase'),
    recommendedProducts: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      benefits: z.array(z.string()),
      availability: z.string(),
      productUrl: z.string(),
      imageUrl: z.string()
    }))
  }),
  execute: async ({ inputData }) => {
    const response = await salesAgent.generate('Please proceed with the sales approach based on the presales data', {
      output: z.object({
        salesResponse: z.string().describe('The sales agent\'s response to close the deal'),
        nextSteps: z.array(z.string()).describe('Recommended next steps for the customer'),
        urgencyLevel: z.enum(['low', 'medium', 'high']).describe('Level of urgency for the purchase')
      })
    });

    return {
      recommendedProducts: inputData.recommendedProducts,
      salesResponse: response.object.salesResponse,
      nextSteps: response.object.nextSteps,
      urgencyLevel: response.object.urgencyLevel
    };
  }
});

// Create the complete sales funnel workflow
export const salesFunnelWorkflow = createWorkflow({
  id: 'salesFunnelWorkflow',
  description: 'Complete sales funnel workflow: Frontend discovery → Presales research → Sales closing',
  inputSchema: z.object({
    customerMessage: z.string().describe('The customer\'s initial message or request'),
    sessionId: z.string().describe('Session identifier for conversation continuity'),
    userId: z.string().optional().describe('User identifier if authenticated')
  }),
  outputSchema: z.object({
    customerProfile: z.object({
      needs: z.string(),
      timeline: z.string(),
      purpose: z.string(),
      budget: z.string().optional(),
      preferences: z.array(z.string()).optional()
    }),
    recommendedProducts: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      benefits: z.array(z.string()),
      availability: z.string(),
      productUrl: z.string(),
      imageUrl: z.string()
    })).max(5),
    salesResponse: z.string(),
    nextSteps: z.array(z.string()),
    urgencyLevel: z.enum(['low', 'medium', 'high'])
  })
})
  .then(frontendStep)
  .then(presalesStep)
  .then(salesStep)
  .commit();

