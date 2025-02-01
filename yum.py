import json
import os
import time
from datetime import datetime

import pandas as pd
from selenium.webdriver import Firefox, FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from tqdm.auto import tqdm
from webdriver_manager.firefox import GeckoDriverManager

DATE = str(datetime.now().date())
FOLDER_PATH = "public"
GECKO_VERSION = "v0.35.0"
URL = "https://obs.itu.edu.tr/public/DersProgram"
TIMEOUT = 5


if not os.path.exists(FOLDER_PATH):
    os.makedirs(FOLDER_PATH)

if not os.path.exists(FOLDER_PATH + "/" + DATE):
    os.makedirs(FOLDER_PATH + "/" + DATE)


def exportJson(path: str, list: list):
    list = [{"value": v, "label": v} for v in list]
    with open(path, "w") as f:
        json.dump(list, f)


options = FirefoxOptions()
options.add_argument("--start-minimized")
options.add_argument("--log-level=0")
options.add_argument("--headless")

gecko_service = FirefoxService(executable_path=GeckoDriverManager(version=GECKO_VERSION).install(), log_output=None)
browser = Firefox(options=options, service=gecko_service)


if __name__ == "__main__":
    browser.get(URL)

    academic_level_dropdown = WebDriverWait(browser, TIMEOUT).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "#select2-programSeviyeTipiId-container"))
    )
    academic_level_dropdown.click()

    # Wait for the options to load and locate all options
    options = WebDriverWait(browser, TIMEOUT).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".select2-results__option"))
    )

    undergraduate_text = ["Lisans", "Undergraduate"]
    undergrad_idx = -1

    for option in options:
        if option.text in undergraduate_text:
            undergrad_idx = options.index(option)
            break

    if undergrad_idx == -1:
        raise Exception("Undergraduate element not found")

    options[undergrad_idx].click()

    dropdown_button = WebDriverWait(browser, TIMEOUT).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "#select2-dersBransKoduId-container"))
    )
    dropdown_button.click()

    # Wait for options to load and get all elements
    course_code_elements = WebDriverWait(browser, TIMEOUT).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul.select2-results__options > li"))
    )
    course_codes = [element.text for element in course_code_elements]

    # Close dropdown
    dropdown_button.click()

    print(f"Courses to parse: {len(course_codes)}")
    headers = None
    for idx, course_code in tqdm(enumerate(course_codes), total=len(course_codes)):
        # Open dropdown
        dropdown_button = WebDriverWait(browser, TIMEOUT).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "#select2-dersBransKoduId-container"))
        )
        dropdown_button.click()

        # Get course code elements
        course_code_elements = WebDriverWait(browser, TIMEOUT).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul.select2-results__options > li"))
        )

        course_code_elements[idx].click()

        show_button = WebDriverWait(browser, 1).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "#dersProgramForm > div > div:nth-child(3) > button"))
        )
        show_button.click()
        try:
            WebDriverWait(browser, 1).until(EC.alert_is_present())
            browser.switch_to.alert.dismiss()
            print(f"No record found for {course_code}")

            continue
        except Exception as e:
            pass

        table = browser.find_element(by=By.CSS_SELECTOR, value=".table")
        rows = table.find_elements(by=By.CSS_SELECTOR, value="tr")

        header = rows.pop(0)
        if headers is None:
            columns = header.find_elements(by=By.CSS_SELECTOR, value="td")
            headers = [col.text.replace(",", ";") for col in columns]

        row_data = []
        if len(rows) != 0:
            for row in rows:
                cols = row.find_elements(by=By.CSS_SELECTOR, value="td")
                cols = [col.text.replace(",", ";").replace("\n", "") for col in cols]
                row_data.append(cols)

        df = pd.DataFrame(data=row_data, columns=headers)
        df.to_csv(path_or_buf=FOLDER_PATH + "/" + DATE + "/" + course_code + ".csv")

    browser.close()
    folders = [f.name for f in os.scandir(FOLDER_PATH) if f.is_dir()]
    exportJson(FOLDER_PATH + "/dates.json", folders)
    exportJson(FOLDER_PATH + "/course_codes.json", course_codes)
