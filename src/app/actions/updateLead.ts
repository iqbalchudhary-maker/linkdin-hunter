"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(id: string, status: "SENT" | "NEW") {
  try {
    await prisma.lead.update({
      where: { id },
      data: { status },
    });
    
    // Dashboard ko refresh karne ke liye taake tabs update ho jayen
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}