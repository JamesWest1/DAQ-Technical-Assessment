
import React, { useState, useEffect } from "react"
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ScatterProps {
    x: number[]
    y: number[]
}


export default function ScatterPlot({x, y}: ScatterProps): JSX.Element {
    return (
      <div>
        <h2>{"Change in temperature over time"}</h2>
        <Plot
          data={[
            {
              x: x,
              y: y,
              mode: 'markers',
              type: 'scatter',
              marker: { color: 'blue' },
            },
          ]}
          layout={{
            title:"Change in temperature over time",
            xaxis: { title: 'Time' },
            yaxis: { title: 'Temperature' },
          }}
        />
      </div>
    );
  };