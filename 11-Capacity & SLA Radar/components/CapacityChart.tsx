import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Client } from "../types";
import styles from "../App.module.css";

interface CapacityChartProps {
  data: Client[];
}

const CapacityChart: React.FC<CapacityChartProps> = ({ data }) => {
  const sortedData = [...data].sort(
    (a, b) => b.capacityUsage - a.capacityUsage
  );

  const getBarColor = (usage: number) => {
    if (usage >= 90) return "rgb(244, 63, 94)";
    if (usage >= 75) return "rgb(245, 158, 11)";
    return "rgb(16, 185, 129)";
  };

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            interval={0}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
            contentStyle={{
              backgroundColor: "#1a1a24",
              border: "1px solid #2a2a3a",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
            labelStyle={{
              color: "#9ca3af",
              fontSize: "10px",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#e5e7eb",
              fontSize: "11px",
            }}
          />
          <ReferenceLine x={80} stroke="#4b5563" strokeDasharray="3 3" />
          <Bar
            dataKey="capacityUsage"
            barSize={10}
            radius={[0, 4, 4, 0]}
            name="Capacity"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.capacityUsage)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CapacityChart;
