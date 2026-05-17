"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(id: string, status: "SENT" | "NEW") {
  try {
    if (!id) throw new Error("ID is required");

    await prisma.lead.update({
      where: { id },
      data: { status },
    });
    
    // Refreshing dashboard for real-time tab updates
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { success: false, error: "Failed to update status" };
  }
}