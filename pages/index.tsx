import Head from "next/head";
import styles from "@/styles/Home.module.css";
// import dates from 'public/dates.json'
import course_codes from "public/course_codes.json";
import CsvTable from "@/components/Table";
import DropdownSelect from "@/components/Select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SelectChangeEvent, Typography, Box, IconButton } from "@mui/material";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const basePath = "/itu-web-archive";
const url =
  "https://raw.githubusercontent.com/keepdying/itu-web-archive/main/public/";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [dates, setDates] = useState<Array<{ value: string; label: string }>>(
    [],
  );
  const [datesLoading, setDatesLoading] = useState<boolean>(true);
  const [datesError, setDatesError] = useState<string | null>(null);

  const isSelectedAll = selectedDate !== "" && selectedCourse !== "";

  function getCsvLink() {
    if (isSelectedAll) {
      return url + selectedDate + "/" + selectedCourse + ".csv";
    } else return "";
  }

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/keepdying/itu-web-archive/main/public/dates.json",
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        setDates(json);
        setDatesError(null);
      })
      .catch((error) => {
        console.error("Error fetching dates:", error);
        setDates([]);
        setDatesError("Error fetching dates. Please try again later.");
      })
      .finally(() => {
        setDatesLoading(false);
      });
  }, []);

  const sortedDates = dates.sort((a, b) => {
    return a.label > b.label ? -1 : 1;
  });

  return (
    <>
      <Head>
        <title>ITU Web Archive</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={basePath + "/favicon.ico"} />
      </Head>
      <main className={styles.main}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <Box sx={{ visibility: "hidden" }}>
            <IconButton>
              <Box sx={{ width: 24, height: 24 }}></Box>
            </IconButton>
          </Box>
          <Typography variant="h1" component="h1" className={styles.header}>
            ITU Web Archive
          </Typography>
          <ThemeToggleButton />
        </Box>
        <div className={styles.top_panel}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <DropdownSelect
              options={sortedDates}
              label={"Dates"}
              selectedValue={selectedDate}
              setSelectedValue={setSelectedDate}
              disabled={datesLoading || !!datesError}
            />
            {datesLoading && <p className={styles.message}>Loading dates...</p>}
            {datesError && (
              <p className={styles.message} style={{ color: "red" }}>
                {datesError}
              </p>
            )}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <DropdownSelect
              options={course_codes}
              label={"Courses"}
              selectedValue={selectedCourse}
              setSelectedValue={setSelectedCourse}
            />
          </div>
        </div>
        <CsvTable csvUrl={getCsvLink()} />
      </main>
    </>
  );
}
