import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { PromptLoader } from "../utils/prompt-loader";

export const frontendAgent = new Agent({
  name: "frontend-agent",
  description: "Frontend orchestrator agent that routes customers through the pre-sales → sales agent pipeline",
  instructions: async ({ runtimeContext }) => {
    const companyName = String(runtimeContext?.get("companyName") || "FisSales");
    const companyDescription = String(runtimeContext?.get("companyDescription") || "Winter sports equipment retailer");
    const conversationHistory = String(runtimeContext?.get("conversationHistory") || "");
    const conversationStage = String(runtimeContext?.get("conversationStage") || "initial");
    const userMessage = String(runtimeContext?.get("userMessage") || "");

    let prompt = await PromptLoader.loadPrompt('frontend-agent');

    // Replace placeholders
    prompt = prompt.replaceAll('{companyName}', companyName);
    prompt = prompt.replaceAll('{companyDescription}', companyDescription);
    prompt = prompt.replaceAll('{conversationHistory}', conversationHistory);
    prompt = prompt.replaceAll('{conversationStage}', conversationStage);
    prompt = prompt.replaceAll('{userMessage}', userMessage);

    return prompt;
  },
  model: openai("gpt-4o-mini"),
});
