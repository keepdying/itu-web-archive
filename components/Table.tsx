import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled, tableCellClasses, useTheme, Input, Box, SelectChangeEvent } from "@mui/material";
import Papa from "papaparse";
import styles from '@/styles/Home.module.css'
import DropdownSelect from "./Select";

// Helper function to get unique, sorted values for a single-select column
const getUniqueSortedColumnValues = (data: any[], columnName: string): Array<{ label: string; value: string }> => {
  if (!data || data.length === 0) return [];
  const values = new Set<string>();
  data.forEach(row => {
    if (row && typeof row === 'object' && row[columnName] && String(row[columnName]).trim() !== '-' && String(row[columnName]).trim() !== '') {
      values.add(String(row[columnName]));
    }
  });
  return Array.from(values).sort().map(value => ({ label: value, value }));
};

// Helper function to get unique, parsed, and sorted values for a multi-select column
const getUniqueParsedAndSortedColumnValues = (data: any[], columnName: string, delimiter: string): Array<{ label: string; value: string }> => {
  if (!data || data.length === 0) return [];
  const values = new Set<string>();
  data.forEach(row => {
    if (row && typeof row === 'object' && row[columnName]) {
      const parsed = String(row[columnName]).split(delimiter);
      parsed.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart !== '' && trimmedPart !== '-') {
          values.add(trimmedPart);
        }
      });
    }
  });
  return Array.from(values).sort().map(value => ({ label: value, value }));
};

export default function CsvTable({csvUrl} : {csvUrl:string}){
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [noDataAvailable, setNoDataAvailable] = useState<boolean>(false);
  const theme = useTheme();

  // State for advanced filters
  const [selectedDay, setSelectedDay] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedMajorRestriction, setSelectedMajorRestriction] = useState<string[]>([]);

  const StyledTableCell = styled(TableCell, {
    shouldForwardProp: (prop) => prop !== 'isPlaceholder',
  })< { isPlaceholder?: boolean } >(({ theme, isPlaceholder }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300],
      color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]),
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 250,
      ...(isPlaceholder && {
        fontStyle: 'italic',
        color: theme.palette.text.disabled,
      }),
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    setTableData([]);
    setSearchTerm("");
    setSelectedDay([]);
    setSelectedBuilding("");
    setSelectedMajorRestriction([]);
    setNoDataAvailable(false);
    if (csvUrl === '') {
      setLoading(false);
      return;
    }
    fetch(csvUrl)
    .then((response) => response.text())
    .then((csv) => {
      const results = Papa.parse(csv, { header: true, skipEmptyLines: true });
      if (!results.data || results.data.length === 0) { 
        setNoDataAvailable(true);
        setTableData([]);
      } else {
        setTableData(results.data);
        setNoDataAvailable(false);
      }
      setLoading(false);
    })
    .catch((error) => {
      setError(error);
      setLoading(false);
      setTableData([]);
      setSearchTerm("");
      setSelectedDay([]);
      setSelectedBuilding("");
      setSelectedMajorRestriction([]);
      setNoDataAvailable(false);
    });
  }, [csvUrl]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Memoize unique values for filter dropdowns
  const dayOptions = useMemo(() => getUniqueSortedColumnValues(tableData, 'Day'), [tableData]);
  const buildingOptions = useMemo(() => getUniqueSortedColumnValues(tableData, 'Building'), [tableData]);
  const majorRestrictionOptions = useMemo(() => getUniqueParsedAndSortedColumnValues(tableData, 'Major Restriction', ', '), [tableData]);

  const filteredData = tableData.filter((row) => {
    // Text search filter
    const searchMatch = searchTerm === "" || Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Day filter
    const dayMatch = selectedDay.length === 0 || (row && selectedDay.includes(String(row['Day'])));

    // Building filter
    const buildingMatch = selectedBuilding === "" || (row && row['Building'] === selectedBuilding);

    // Major Restriction filter
    let majorRestrictionMatch = true;
    if (selectedMajorRestriction.length > 0) {
      const rowMajorsString = row && row['Major Restriction'] ? String(row['Major Restriction']) : "";
      if (!rowMajorsString) {
        majorRestrictionMatch = false;
      } else {
        const rowMajorCodes = rowMajorsString.split(', ').map(code => code.trim()).filter(code => code !== '' && code !== '-');
        majorRestrictionMatch = selectedMajorRestriction.some(selectedCode => rowMajorCodes.includes(selectedCode));
      }
    }

    return searchMatch && dayMatch && buildingMatch && majorRestrictionMatch;
  });

  if (csvUrl == '') {
    return <h2 className={styles.message}>Please select a date and course code to view the timetable.</h2>;
  }

  if (loading) {
    return <h2 className={styles.message}>Loading...</h2>;
  }

  if (error) {
    return <h2 className={styles.message}>Error: {error.message}</h2>;
  }

  if (noDataAvailable) {
    return <h2 className={styles.message}>No timetable data available for this selection.</h2>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input 
          placeholder="Search table..." 
          value={searchTerm} 
          onChange={handleSearchChange} 
          sx={{ flexGrow: 1, padding: '4px 8px', border: '1px solid lightgray', borderRadius: '4px' }} 
        />
        {dayOptions.length > 0 && (
          <Box sx={{ minWidth: 150 }}>
            <DropdownSelect
              isMulti={true}
              options={[{ label: "All Days", value: "" }, ...dayOptions]}
              label="Day"
              selectedValue={selectedDay}
              setSelectedValue={setSelectedDay}
            />
          </Box>
        )}
        {buildingOptions.length > 0 && (
          <Box sx={{ minWidth: 150 }}>
            <DropdownSelect
              options={[{ label: "All Buildings", value: "" }, ...buildingOptions]}
              label="Building"
              selectedValue={selectedBuilding}
              setSelectedValue={setSelectedBuilding}
            />
          </Box>
        )}
        {majorRestrictionOptions.length > 0 && (
          <Box sx={{ minWidth: 250, maxWidth: 400 }}>
            <DropdownSelect
              isMulti={true}
              options={[{ label: "All Major Restrictions", value: "" }, ...majorRestrictionOptions]}
              label="Major Restriction"
              selectedValue={selectedMajorRestriction}
              setSelectedValue={setSelectedMajorRestriction}
            />
          </Box>
        )}
      </Box>
      <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
        <Table sx={{minWidth: 650}} size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {Object.keys(tableData[0] || {}).map((header) => {
                let columnStyle: React.CSSProperties = {};
                if (header === 'Course Title') {
                  columnStyle = { minWidth: '200px', maxWidth: '350px' };
                } else if (header === 'Major Restriction') {
                  columnStyle = { minWidth: '250px', maxWidth: '400px' };
                } else if (header === 'Instructor') {
                  columnStyle = { minWidth: '150px', maxWidth: '250px' };
                } else if (['CRN', 'Capacity', 'Enrolled', 'Credit/Class Resc.'].includes(header)) {
                  columnStyle = { width: '80px', whiteSpace: 'normal' };
                } else if (header === 'Time' || header === 'Day') {
                  columnStyle = { minWidth: '120px' };
                }
                return (
                  <StyledTableCell key={header} style={columnStyle}>
                    {header}
                  </StyledTableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <StyledTableRow key={index}>
                {Object.entries(row).map(([key, cellValue], cellIndex) => {
                  const cellContent = cellValue as string;
                  let cellSpecificStyle: React.CSSProperties = {};
                  if (key === 'Course Title') {
                    cellSpecificStyle = { minWidth: '200px', maxWidth: '350px' };
                  } else if (key === 'Major Restriction') {
                    cellSpecificStyle = { minWidth: '250px', maxWidth: '400px' };
                  } else if (key === 'Instructor') {
                    cellSpecificStyle = { minWidth: '150px', maxWidth: '250px' };
                  } else if (['CRN', 'Capacity', 'Enrolled', 'Credit/Class Resc.'].includes(key)) {
                    cellSpecificStyle = { width: '80px' };
                  } else if (key === 'Time' || key === 'Day') {
                    cellSpecificStyle = { minWidth: '120px' };
                  }

                  return (
                    <StyledTableCell 
                      key={cellIndex} 
                      isPlaceholder={cellContent === '-'} 
                      title={cellContent}
                      style={cellSpecificStyle}
                    >
                      {cellContent}
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            ))}
            {filteredData.length === 0 && searchTerm !== "" && (
              <TableRow>
                <TableCell colSpan={Object.keys(tableData[0] || {}).length} align="center">
                  No results found for "{searchTerm}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
