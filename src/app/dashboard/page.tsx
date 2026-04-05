import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  // Purana "NEW" aur naya "new" dono fetch karein
  const newLeads = await prisma.lead.findMany({
    where: {
      status: {
        in: ["NEW", "new"] 
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Purana "SENT" aur naya "sent" dono fetch karein
  const sentLeads = await prisma.lead.findMany({
    where: {
      status: {
        in: ["SENT", "sent"]
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient initialNewLeads={newLeads} initialSentLeads={sentLeads} />;
}