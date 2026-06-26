import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-access-token");
  const password = process.env.ACCESS_PASSWORD;
  if (!password) {
    return Response.json({ error: "서버 설정 오류" }, { status: 500 });
  }
  if (token !== password) {
    return Response.json({ error: "비밀번호가 올바르지 않습니다" }, { status: 401 });
  }
  return Response.json({ ok: true });
}
