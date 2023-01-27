import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const CSVTable = ({ url }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  }, [url]);

  return (
    <table>
      <thead>
        <tr>
          {data[0] &&
            Object.keys(data[0]).map((cell, index) => (
              <th key={index}>{cell}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(row).map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CSVTable;
