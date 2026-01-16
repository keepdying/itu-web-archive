import Head from "next/head";
import styles from "@/styles/Home.module.css";
import CsvTable from "@/components/Table";
import DropdownSelect from "@/components/Select";
import { useEffect, useState } from "react";
import { Typography, Box, IconButton } from "@mui/material";
import ThemeToggleButton from "@/components/ThemeToggleButton";

const basePath = "/itu-web-archive";

const educationLevels = [
  { value: "LS", label: "Undergraduate (Lisans)" },
  { value: "OL", label: "Associate" },
  { value: "LU", label: "Graduate" },
  { value: "LUI", label: "Graduate Level Evening Education" },
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("LS"); // Default to Undergraduate
  const [dates, setDates] = useState<Array<{ value: string; label: string }>>(
    [],
  );
  const [datesLoading, setDatesLoading] = useState<boolean>(true);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [courseCodesByLevel, setCourseCodesByLevel] = useState<{
    [key: string]: string[];
  }>({});
  const [courseCodesLoading, setCourseCodesLoading] = useState<boolean>(true);

  const baseUrl = basePath + "/";

  const isSelectedAll =
    selectedDate !== "" && selectedCourse !== "" && selectedLevel !== "";

  function getCsvLink() {
    if (isSelectedAll) {
      // LS files have no prefix, other levels have prefix (e.g., OL-AKM.csv)
      const filename =
        selectedLevel === "LS"
          ? `${selectedCourse}.csv`
          : `${selectedLevel}-${selectedCourse}.csv`;
      return baseUrl + selectedDate + "/" + filename;
    } else return "";
  }

  useEffect(() => {
    const datesUrl = basePath + "/dates.json";

    fetch(datesUrl)
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

  // Fetch course codes by level
  useEffect(() => {
    const courseCodesUrl = basePath + "/course_codes_by_level.json";

    fetch(courseCodesUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        if (json.by_level) {
          setCourseCodesByLevel(json.by_level);
        } else {
          setCourseCodesByLevel(json);
        }
      })
      .catch((error) => {
        console.error("Error fetching course codes:", error);
        setCourseCodesByLevel({});
      })
      .finally(() => {
        setCourseCodesLoading(false);
      });
  }, []);

  // Reset selected course when level changes
  useEffect(() => {
    setSelectedCourse("");
  }, [selectedLevel]);

  const sortedDates = dates.sort((a, b) => (a.label > b.label ? -1 : 1));

  // Get course codes for selected level
  const courseCodesForLevel = courseCodesByLevel[selectedLevel] || [];
  const courseCodesOptions = courseCodesForLevel
    .map((code) => ({ value: code, label: code }))
    .sort((a, b) => a.label.localeCompare(b.label));

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
              options={educationLevels}
              label={"Education Level"}
              selectedValue={selectedLevel}
              setSelectedValue={setSelectedLevel}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <DropdownSelect
              options={courseCodesOptions}
              label={"Courses"}
              selectedValue={selectedCourse}
              setSelectedValue={setSelectedCourse}
              disabled={courseCodesLoading || courseCodesOptions.length === 0}
            />
            {courseCodesLoading && (
              <p className={styles.message}>Loading courses...</p>
            )}
            {!courseCodesLoading &&
              courseCodesOptions.length === 0 &&
              selectedLevel && (
                <p className={styles.message}>
                  No courses available for this level
                </p>
              )}
          </div>
        </div>
        <CsvTable csvUrl={getCsvLink()} />
      </main>
    </>
  );
}
