import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getSingleCompanyInfo } from "../../database/utils";

// Tool to fetch company information from the database
export const companyInfoTool: ReturnType<typeof createTool> = createTool({
  id: "get-company-info",
  description: "Retrieves company information including name, description, policies, and contact details from the database",
  inputSchema: z.object({}), // No input needed - only one company
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    policies: z.array(z.string()),
    contactInfo: z.record(z.any()),
    updatedAt: z.string(),
    found: z.boolean(),
  }),
  execute: async () => {
    try {
      const companyInfo = await getSingleCompanyInfo();

      if (!companyInfo) {
        return {
          id: "company",
          name: "FisSales",
          description: "Premium winter sports equipment retailer",
          policies: [
            "30-day return policy",
            "Free shipping on orders over $100",
            "1-year warranty on all equipment"
          ],
          contactInfo: {
            email: "support@fissales.com",
            phone: "+1-800-FISSALES",
            address: "123 Winter Sports Ave, Snow Valley, CO 80424"
          },
          updatedAt: new Date().toISOString(),
          found: false,
        };
      }

      return {
        id: companyInfo.id,
        name: companyInfo.name,
        description: companyInfo.description,
        policies: companyInfo.policies,
        contactInfo: companyInfo.contactInfo,
        updatedAt: companyInfo.updatedAt.toISOString(),
        found: true,
      };
    } catch (error) {
      console.error("Failed to fetch company info:", error);

      // Return default company info on error
      return {
        id: "company",
        name: "FisSales",
        description: "Premium winter sports equipment retailer",
        policies: [
          "30-day return policy",
          "Free shipping on orders over $100",
          "1-year warranty on all equipment"
        ],
        contactInfo: {
          email: "support@fissales.com",
          phone: "+1-800-FISSALES",
          address: "123 Winter Sports Ave, Snow Valley, CO 80424"
        },
        updatedAt: new Date().toISOString(),
        found: false,
      };
    }
  },
});
