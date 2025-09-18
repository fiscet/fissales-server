import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { PromptLoader } from "../utils/prompt-loader";
import { companyInfoTool } from "../tools/company-info-tool";

export const companyAgent = new Agent({
  name: "company-agent",
  description: "Company information specialist that provides accurate information about the company using real-time data from the database",
  instructions: async ({ runtimeContext }) => {
    const companyName = String(runtimeContext?.get("companyName") || "FisSales");
    const companyDescription = String(runtimeContext?.get("companyDescription") || "Winter sports equipment retailer");
    const userMessage = String(runtimeContext?.get("userMessage") || "");
    const conversationHistory = String(runtimeContext?.get("conversationHistory") || "");

    // Fetch real company information from database
    let companyPolicies = "Standard return and warranty policies";
    let contactInfo = "Contact us for more information";

    try {
      const companyInfo = await companyInfoTool.execute?.({
        context: { companyId: "company" },
        runtimeContext,
      });

      if (companyInfo.found) {
        companyPolicies = companyInfo.policies.join(', ');
        contactInfo = JSON.stringify(companyInfo.contactInfo, null, 2);
      }
    } catch (error) {
      console.error("Failed to fetch company info for prompt:", error);
    }

    let prompt = await PromptLoader.loadPrompt('company-agent');

    // Replace placeholders with real data
    prompt = prompt.replaceAll('{companyName}', companyName);
    prompt = prompt.replaceAll('{companyDescription}', companyDescription);
    prompt = prompt.replaceAll('{companyPolicies}', companyPolicies);
    prompt = prompt.replaceAll('{contactInfo}', contactInfo);
    prompt = prompt.replaceAll('{userMessage}', userMessage);
    prompt = prompt.replaceAll('{conversationHistory}', conversationHistory);

    return prompt;
  },
  model: openai("gpt-4o-mini"),
  tools: {
    companyInfoTool,
  },
});
