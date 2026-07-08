"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import ChartCard from "./ChartCard";

const revenueData = [
  { month: "Jan", revenue: 12 },
  { month: "Feb", revenue: 18 },
  { month: "Mar", revenue: 16 },
  { month: "Apr", revenue: 24 },
  { month: "May", revenue: 28 },
  { month: "Jun", revenue: 31 },
  { month: "Jul", revenue: 36 },
];

export default function RevenueChart() {
  return (
    <ChartCard
      title="Revenue Analytics"
      subtitle="Monthly revenue performance"
      actionLabel="Analytics"
    >
      <div className="mb-8 grid gap-5 md:grid-cols-3">

        <div>

          <p className="text-sm text-slate-500">
            Total Revenue
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            ₹28.4L
          </h3>

        </div>

        <div>

          <p className="text-sm text-slate-500">
            Growth
          </p>

          <h3 className="mt-2 text-3xl font-bold text-green-600">
            +18.4%
          </h3>

        </div>

        <div>

          <p className="text-sm text-slate-500">
            Monthly Target
          </p>

          <h3 className="mt-2 text-3xl font-bold text-[#0A3F61]">
            72%
          </h3>

        </div>

      </div>

      <div className="h-[340px] w-full">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={revenueData}>

            <defs>

              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="5%"
                  stopColor="#0A3F61"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#0A3F61"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#E2E8F0"
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                boxShadow:
                  "0 10px 30px rgba(15,23,42,.08)",
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0A3F61"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>
    </ChartCard>
  );
}