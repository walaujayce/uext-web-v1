import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Generate initial breathing waveform data
const generateBreathingWave = () => {
  const newData = [];
  for (let i = 0; i < 100; i++) {
    let y = Math.sin(i * 0.2) * 10 + 15; // Smooth breathing curve
    newData.push({ x: i, y });
  }
  return newData;
};

const RespirationChart = () => {
  const [data, setData] = useState(generateBreathingWave());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)]; // Remove first point
        const lastX = newData[newData.length - 1].x;
        let newY = Math.sin(lastX * 0.2) * 10 + 15; // Smooth sinusoidal wave
        newData.push({ x: lastX + 1, y: newY });

        return newData;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" hide />
        <YAxis domain={[0, 30]} />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="blue" strokeWidth={3} dot={false} animationDuration={0} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RespirationChart;
