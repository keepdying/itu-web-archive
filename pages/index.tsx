import Head from 'next/head'
import styles from '@/styles/Home.module.css'
// import dates from 'public/dates.json'
import course_codes from 'public/course_codes.json'
import CsvTable from '@/components/Table'
import DropdownSelect from '@/components/Select'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button, SelectChangeEvent, StepButton } from '@mui/material'

const basePath = '/itu-web-archive'
const url = 'https://raw.githubusercontent.com/keepdying/itu-web-archive/main/public/'

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const isSelectedAll = selectedDate !== '' && selectedCourse !== '';
  const [dates, setDates] = useState<Array<{value: string, label: string}>>([]);
  
  function getCsvLink(){
    if(isSelectedAll){
      return url + selectedDate + '/' + selectedCourse + '.csv'
    } else
    return ''
  }
  
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/keepdying/itu-web-archive/main/public/dates.json")
      .then((response) => response.json())
      .then((json) => setDates(json))
      .catch((error) => setDates([{value: "", label: "Error fetching dates"}]));
  }, []);

  const sortedDates = dates.sort((a, b) => {return a.label > b.label ? -1 : 1});

  function handleChange(e: SelectChangeEvent<String>, setSelectedValue: Dispatch<SetStateAction<string>>){
    setSelectedValue(e.target.value as string);
  }

  return (
    <>
      <Head>
        <title>ITU Web Archive</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={basePath + "/favicon.ico"} />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.header}>ITU Web Archive</h1>
        <div className={styles.top_panel}>
          <DropdownSelect 
            options={sortedDates}
            label={'Dates'}
            selectedValue={selectedDate}
            setSelectedValue={setSelectedDate}
            handleChange={handleChange}
          />
          <DropdownSelect
            options={course_codes}
            label={'Courses'}
            selectedValue={selectedCourse}
            setSelectedValue={setSelectedCourse}
            handleChange={handleChange}
          />
        </div>
        <CsvTable csvUrl={getCsvLink()}/>
      </main>
    </>
  )
}
