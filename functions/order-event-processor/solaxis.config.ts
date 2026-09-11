import { defineFunction } from "@solaxis/sdk";
import { z } from "zod";

export default defineFunction({
  name: "order-event-processor",
  description: "Developer-owned webhook order processor",
  defaultIterations: 1,
  targetValidator: "standard-er",
  programId: "D9z5WitdAhw1yhougBPMETFRDrg91h7pNjEHzyayLEeJ",
  inputSchema: z.object({
    seed: z.number().default(42),
    iterations: z.number().default(1),
  }),
});
