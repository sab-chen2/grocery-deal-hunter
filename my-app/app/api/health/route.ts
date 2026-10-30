import { db } from "@/src/prisma/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.orm.public.Store.limit(1).all();

    return Response.json({
      status: "ok",
      db: "ok",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return Response.json(
      {
        status: "ok",
        db: "error",
      },
      { status: 503 }
    );
  }
}
