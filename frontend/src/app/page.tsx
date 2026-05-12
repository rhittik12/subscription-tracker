import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <DashboardContent />
    </Suspense>
  );
}