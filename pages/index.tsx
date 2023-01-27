import Link from "next/link";
import Layout from "../components/layout";
import Dropdown from "../components/dropdown";
import CSVTable from "../components/csvtable";
import dates from "../public/dates.json";
import course_codes from "../public/course_codes.json";

export default function Home() {
  return (
    <Layout>
      <div className="flex">
        <Dropdown options={dates}></Dropdown>
        <Dropdown options={course_codes}></Dropdown>
      </div>
      {/* <CSVTable url={}></CSVTable> */}
    </Layout>
  );
}
