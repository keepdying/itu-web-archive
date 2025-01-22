from selenium.webdriver import Firefox, FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from datetime import datetime
import pandas as pd
import os
import json
from tqdm import tqdm
import time

DATE = str(datetime.now().date())
FOLDER_PATH = "public"

def exportJson(path: str, list: list):
    list = [{"value": v, "label": v} for v in list]
    with open(path, 'w') as f:
        json.dump(list, f)


if not os.path.exists(FOLDER_PATH):
   os.makedirs(FOLDER_PATH)

if not os.path.exists(FOLDER_PATH + "/" + DATE):
   os.makedirs(FOLDER_PATH + "/" + DATE)

url = "https://www.sis.itu.edu.tr/EN/student/course-schedules/course-schedules.php?seviye=LS&derskodu="
options = FirefoxOptions()
options.add_argument("--start-minimized")
options.add_argument("--log-level=0")
options.add_argument("--headless")

browser = Firefox(options=options, service=FirefoxService(executable_path="python_testing/geckodriver",log_path="/dev/null"))
browser.get(url)

academic_level_dropdown = WebDriverWait(browser, 10).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "#select2-programSeviyeTipiId-container"))
)
academic_level_dropdown.click()

# Wait for the options to load and locate all options
options = WebDriverWait(browser, 10).until(
    EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".select2-results__option"))
)

# Click the second element (index 1 because indexing starts from 0)
if len(options) > 1:  # Ensure there are at least two options
    options[2].click()
else:
    print("There are not enough options to select the second one.")



dropdown_button = WebDriverWait(browser, 10).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, ".select2-selection__placeholder"))
)
dropdown_button.click()

# Wait for options to load and get all elements
course_code_elements = WebDriverWait(browser, 10).until(
    EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul.select2-results__options > li"))
)


course_codes = []
for i, element in enumerate(course_code_elements):
    course_codes.append(element.text)

for i in range(len(course_code_elements)):
    course_codes = []
    course_code_elements[i].click()

    show_button = WebDriverWait(browser, 1).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".btn-block")))
    
    show_button.click()
    try:
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
        df.to_csv(path_or_buf=FOLDER_PATH + "/" + DATE + "/" + "Dersler" + ".csv")
    except:

        print("kayit yok")
    
    dropdown_button = WebDriverWait(browser, 1).until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "#select2-dersBransKoduId-container")))
    dropdown_button.click()
    course_code_elements = WebDriverWait(browser, 1).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul.select2-results__options > li")))
    for i, element in enumerate(course_code_elements):
        course_codes.append(element.text)

"""
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
"""
browser.close()

folders = [f.name for f in os.scandir(FOLDER_PATH) if f.is_dir()]
exportJson(FOLDER_PATH + '/dates.json', folders)
exportJson(FOLDER_PATH + '/course_codes.json', course_codes)
