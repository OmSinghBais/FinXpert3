"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { ProductSnapshot } from "@/lib/adapters";

const COLORS = {
  MUTUAL_FUND: "#10b981", // emerald
  LOAN: "#ef4444", // rose
  INSURANCE: "#3b82f6", // blue
};

export function PortfolioChart({ positions }: { positions: ProductSnapshot[] }) {
  const data = positions.reduce(
    (acc, pos) => {
      const type = pos.type;
      const existing = acc.find((item) => item.name === type);
      if (existing) {
        existing.value += Math.abs(pos.currentValue);
      } else {
        acc.push({
          name: type,
          value: Math.abs(pos.currentValue),
        });
      }
      return acc;
    },
    [] as Array<{ name: string; value: number }>,
  );

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-800/70 text-slate-400">
        No data to display
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-800/70 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Portfolio Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[entry.name as keyof typeof COLORS] || "#6b7280"
                }
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `₹${value.toLocaleString("en-IN")}`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

