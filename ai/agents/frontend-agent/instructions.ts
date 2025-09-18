import { PromptLoader } from "@/ai/utils/prompt-loader";
import { MastraContext } from "@/types";
import { RuntimeContext } from "@mastra/core/runtime-context";

export const instructions = async (runtimeContext: RuntimeContext<MastraContext>) => {
  const companyName = String(
    runtimeContext?.get('companyName') || 'My Company'
  );
  const companyDescription = String(
    runtimeContext?.get('companyDescription')
  );

  let prompt = await PromptLoader.loadPrompt('frontend-agent');

  // Replace placeholders
  prompt = prompt.replaceAll('{companyName}', companyName);
  prompt = prompt.replaceAll('{companyDescription}', companyDescription);

  return prompt;
};