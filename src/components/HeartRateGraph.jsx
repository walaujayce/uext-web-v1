import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const generateHeartbeatWave = () => {
  const newData = [];
  for (let i = 0; i < 50; i++) {
    let y = Math.sin(i * 0.3) * 20; // Base sine wave
    if (i % 30 === 0) y = 50; // Create heartbeat spike
    if (i % 30 === 1) y = -30; // Small drop after spike
    newData.push({ x: i, y });
  }
  return newData;
};

const HeartBeatGraph = () => {
  const [data, setData] = useState(generateHeartbeatWave());

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        // Shift the data left (simulate moving wave)
        const newData = [...prevData.slice(1)];
        const lastX = newData[newData.length - 1].x;
        let newY = Math.sin(lastX * 0.3) * 20;
        if (lastX % 30 === 0) newY = 50;
        if (lastX % 30 === 1) newY = -30;
        newData.push({ x: lastX + 1, y: newY });

        return newData;
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" hide />
        <YAxis domain={[-60, 60]} />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="red" strokeWidth={3} dot={false} animationDuration={0} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HeartBeatGraph;
