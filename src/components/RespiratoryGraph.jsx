import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

const RespirationChart = ({ respirationArray, minBaselineX, maxBaselineX }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!respirationArray || respirationArray.length === 0) return;

    const formatted = respirationArray.map((value, index) => ({
      x: index,
      y: value,
    }));

    setData(formatted);

    console.log("respirationArray", respirationArray);
  }, [respirationArray]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: -30, bottom: 15 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="x" type="number" domain={[0, 59]} axisLine={false} tickLine={false} hide />
        <YAxis domain={[0, 40]} />
        <Tooltip
          labelFormatter={(label) => `x: ${label}`}
          formatter={(value) => [`y: ${value}`]}
        />
        {minBaselineX &&<ReferenceLine
          y={minBaselineX}
          stroke="red"
          strokeWidth={2}
          ifOverflow="extendDomain"
        />}
        {maxBaselineX &&<ReferenceLine
          y={maxBaselineX}
          stroke="red"
          strokeWidth={2}
          ifOverflow="extendDomain"
        />}
         <Line
          type="monotone"
          dataKey="y"
          stroke="#007bff"
          strokeWidth={3}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Generate initial breathing waveform data
// const generateBreathingWave = () => {
//   const newData = [];
//   for (let i = 0; i < 100; i++) {
//     let y = Math.sin(i * 0.2) * 10 + 15; // Smooth breathing curve
//     newData.push({ x: i, y });
//   }
//   return newData;
// };

// const RespirationChart = ({respirationArray}) => {
//   const [data, setData] = useState([]);

//   useEffect(()=>{
//     console.log("array[graph]: ", respirationArray);
//   },[respirationArray])
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setData(respirationArray);
//     }, 100); // Update every 100ms for smooth animation

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="x" hide />
//         <YAxis domain={[0, 30]} />
//         <Tooltip />
//         <Line type="monotone" dataKey="y" stroke="blue" strokeWidth={3} dot={false} animationDuration={0} />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// };

export default RespirationChart;
