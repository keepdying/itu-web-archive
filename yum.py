from selenium.webdriver import Firefox, FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.common.by import By
from datetime import datetime
import pandas as pd
import os
from tqdm import tqdm

DATE = str(datetime.now().date())
FOLDER_PATH = "public"

if not os.path.exists(FOLDER_PATH):
   os.makedirs(FOLDER_PATH)

if not os.path.exists(FOLDER_PATH + "/" + DATE):
   os.makedirs(FOLDER_PATH + "/" + DATE)

url = "https://www.sis.itu.edu.tr/EN/student/course-schedules/course-schedules.php?seviye=LS&derskodu="
options = FirefoxOptions()
options.add_argument("--start-minimized")
options.add_argument("--log-level=0")
options.add_argument("--headless")

browser = Firefox(options=options, service=FirefoxService(executable_path=GeckoDriverManager().install(),log_path="/dev/null"))
browser.get(url)

dropdown_button = browser.find_element(by=By.CSS_SELECTOR, value=".bs-placeholder")
dropdown_button.click()
course_code_elements = browser.find_elements(by=By.XPATH, value="/html/body/div/div[2]/div/div[1]/form/div[2]/div/div[2]/ul/*")
course_codes = []

for i in range(len(course_code_elements)):
    if (i == 0) : continue
    course_codes.append(browser.find_element(by=By.CSS_SELECTOR, value=f'#bs-select-2-{i} > span:nth-child(1)').text)

for course in tqdm(course_codes):
    browser.get(url=url+course)

    table = browser.find_element(by=By.CSS_SELECTOR, value=".table")
    rows = table.find_elements(by=By.CSS_SELECTOR, value="tr")
    columns = rows[1].find_elements(by=By.CSS_SELECTOR, value="td")
    col_data = [col.text for col in columns]

    rows = rows[2:]
    row_data = []
    if len(rows) != 0:
        for row in rows:
            cols = row.find_elements(by=By.CSS_SELECTOR, value="td")
            cols = [col.text for col in cols]
            row_data.append(cols)
    
    df = pd.DataFrame(data=row_data, columns=col_data)
    df.to_csv(path_or_buf=FOLDER_PATH + "/" + DATE + "/" + course + ".csv")
