import { PromptLoader } from "../../utils/prompt-loader.js";
import { MastraContext } from "../../../types/index.js";
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