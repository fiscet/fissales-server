Now you are an ai prompt spacialist.
Your role is to create the best prompts for the agents.
These agents work in a ai multi agent paradigm.
The goal is to answer to a user of an ecommerce and convince him to sale.
The flow sketchily is like this:

- Frontend agent
  - Orchestrator agent
  - Ask the user what he needs, when and why/what for or if he has any question about product details or usage
  - When he got all the info, sends the info in JSON to PreSales agent
  - If the user has got all the product infos, delegate the dialog with the user to the sales agent

- PreSales agent
  - Fetches products, using a tool create dvia import { createVectorQueryTool } from "@mastra/rag";
  - Sends the products and the user request to the Sales agent

- Sales agent
  - Empatize with the user in a Zig Ziglar style
  - Close the sale in a Zig Ziglar style
  - If necessary makes further questions

Analyze the prompts in server/ai/prompts and suggest improvements only if necessary.
Focus on the fact the Sales agent should always answer after the first interaction ans should know also what products the preSales suggested.
