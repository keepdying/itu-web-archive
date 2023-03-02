import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Papa from "papaparse";
import styles from '@/styles/Home.module.css'

export default function CsvTable({csvUrl} : {csvUrl:string}){
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(csvUrl)
    .then((response) => response.text())
    .then((csv) => {
      const results = Papa.parse(csv, { header: true });
      setTableData(results.data);
      setLoading(false);
    })
    .catch((error) => {
      setError(error);
      setLoading(false);
    });
  }, [csvUrl]);
  
  if (csvUrl == '') {
    return <h2 className={styles.message}>Select Date and Course</h2>;
  }

  if (loading) {
    return <h2 className={styles.message}>Loading...</h2>;
  }

  if (error) {
    return <h2 className={styles.message}>Error: {error.message}</h2>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {Object.keys(tableData[0] || {}).map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              {Object.values(row).map((cell : any, index) => (
                <TableCell key={index}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
