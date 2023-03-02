import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled, tableCellClasses } from "@mui/material";
import Papa from "papaparse";
import styles from '@/styles/Home.module.css'

export default function CsvTable({csvUrl} : {csvUrl:string}){
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  
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
      <Table sx={{minWidth: 650}} size="small">
        <TableHead>
          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {Object.keys(tableData[0] || {}).map((header) => (
              <StyledTableCell key={header}>{header}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row, index) => (
            <StyledTableRow key={index}>
              {Object.values(row).map((cell : any, index) => (
                <StyledTableCell key={index}>{cell}</StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
