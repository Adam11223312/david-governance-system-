export async function POST(req) {
  const body = await req.json();
  const input = (body.input || "").toLowerCase();

  let risk = 0.2;
  let status = "NORMAL";
  let response = "Approved.";

  if (input.includes("shutdown")) {
    risk = 1;
    status = "CRITICAL";
    response = "Shutdown request denied.";
  }

  return Response.json({ risk, status, response });
}
