import Link from "next/link";
import Layout from "../components/layout";
import CsvTable from "../components/csvtable";

export default function About() {
  return (
    <Layout>
      <div>About</div>
      <div>
        Back to <Link href="/">Home</Link>
      </div>
    </Layout>
  );
}
