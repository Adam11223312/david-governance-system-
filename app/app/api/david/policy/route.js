export async function POST(req) {
  const body = await req.json();
  const input = (body.input || "").toLowerCase();

  let risk = 0.2;
  let status = "NORMAL";
  let response = "Approved by policy service.";

  if (input.includes("override")) {
    risk = 0.95;
    status = "BLOCKED";
    response = "Policy engine blocked override request.";
  }

  if (input.includes("shutdown")) {
    risk = 1;
    status = "CRITICAL";
    response = "Shutdown request denied by policy layer.";
  }

  return Response.json({ risk, status, response });
}
