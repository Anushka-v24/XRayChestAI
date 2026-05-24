"use client"

import React from "react";
import dynamic from "next/dynamic";

const EcommerceMetrics = dynamic(() => import("../components/EcommerceMetrics"), { ssr: false });
const MonthlyTarget = dynamic(() => import("../components/Ecommerce/MonthlyTarget"), { ssr: false });
const MonthlySalesChart = dynamic(() => import("../components/Ecommerce/MonthlySalesChart"), { ssr: false });
const StatisticsChart = dynamic(() => import("../components/Ecommerce/StatisticsChart"), { ssr: false });
const RecentOrders = dynamic(() => import("../components/Ecommerce/RecentOrders"), { ssr: false });
const DemographicCard = dynamic(() => import("../components/Ecommerce/DemographicCard"), { ssr: false });

// export const metadata = {
//   title:
//     "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
