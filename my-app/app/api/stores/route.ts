import { db } from "@/src/prisma/db";

export async function GET() {
  try {
    const stores = await db.orm.public.Store
      .select("storeId", "name", "websiteUrl")
      .orderBy((store) => store.name.asc())
      .all();

    return Response.json({ stores });
  } catch (error) {
    console.error("Failed to retrieve stores:", error);

    return Response.json(
      { error: "Unable to retrieve stores" },
      { status: 500 }
    );
  }
}
