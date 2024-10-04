import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../../../middlewares/authMiddleware";
import { terminateSubscriptionHandler } from "@/controllers/subscriptionController";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    await authenticate(terminateSubscriptionHandler, true)(req, res); // Only admin can extend
  } else {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
