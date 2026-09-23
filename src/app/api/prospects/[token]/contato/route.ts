import { handleProspectPost } from "@/features/prospects/data/http";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  return handleProspectPost(request, context, "contato");
}
