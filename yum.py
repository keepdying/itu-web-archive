import argparse
import json
import os
from datetime import datetime
from io import StringIO

import pandas as pd
import requests
from tqdm.auto import tqdm

DATE = str(datetime.now().date())
FOLDER_PATH = "public"
# All available program levels
PROGRAM_LEVELS = {
    "OL": "Associate",
    "LS": "Undergraduate",
    "LU": "Graduate",
    "LUI": "Graduate Level Evening Education"
}
BASE_URL = "https://obs.itu.edu.tr/public/DersProgram"
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds

# Headers to request English version
HEADERS = {
    'Accept-Language': 'en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7'
}

if not os.path.exists(FOLDER_PATH):
    os.makedirs(FOLDER_PATH)

if not os.path.exists(FOLDER_PATH + "/" + DATE):
    os.makedirs(FOLDER_PATH + "/" + DATE)


def exportJson(path: str, list: list):
    list = [{"value": v, "label": v} for v in list]
    with open(path, "w") as f:
        json.dump(list, f)


def fetch_branch_codes(program_level: str):
    """Fetch branch codes and IDs from the API."""
    url = f"{BASE_URL}/SearchBransKoduByProgramSeviye?programSeviyeTipiAnahtari={program_level}"
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if attempt < MAX_RETRIES - 1:
                print(f"Retrying branch codes fetch (attempt {attempt + 1}/{MAX_RETRIES})...")
                import time
                time.sleep(RETRY_DELAY)
            else:
                raise Exception(f"Failed to fetch branch codes after {MAX_RETRIES} attempts: {e}")


def fetch_course_data(program_level: str, branch_id: int):
    """Fetch course data for a specific branch ID."""
    url = f"{BASE_URL}/DersProgramSearch?ProgramSeviyeTipiAnahtari={program_level}&dersBransKoduId={branch_id}"
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            response.raise_for_status()
            
            # Check if response contains a table
            if "dersProgramContainer" not in response.text:
                return None  # No data available
            
            # Parse HTML table using pandas
            # pandas.read_html automatically extracts text from links by default
            dfs = pd.read_html(StringIO(response.text))
            if not dfs or len(dfs) == 0:
                return None
            
            df = dfs[0]
            
            # Clean up column names:
            # - Replace commas with semicolons to match original format
            # - Normalize newlines and carriage returns (e.g., "Reservation\nMaj./Cap./Enrl.")
            # - Strip whitespace
            df.columns = [col.replace(",", ";").replace("\n", " ").replace("\r", "").replace("\x0D", "").replace("\x0A", " ").strip() 
                         for col in df.columns]
            
            # Clean up data: strip whitespace from all string columns
            for col in df.columns:
                if df[col].dtype == 'object':
                    df[col] = df[col].astype(str).str.strip()
                    # Replace 'nan' strings with empty strings
                    df[col] = df[col].replace('nan', '')
            
            return df
        except (requests.exceptions.RequestException, ValueError) as e:
            if attempt < MAX_RETRIES - 1:
                import time
                time.sleep(RETRY_DELAY)
            else:
                # Return None if we can't parse (likely no data)
                return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch ITU course schedules from API')
    parser.add_argument('--courses', '-c', nargs='+', help='Filter by specific course codes (e.g., BBF AKM)')
    parser.add_argument('--level', '-l', choices=list(PROGRAM_LEVELS.keys()), help='Filter by specific education level')
    args = parser.parse_args()
    
    # Filter course codes if specified
    filter_courses = set(args.courses) if args.courses else None
    filter_level = args.level
    
    # Track course codes by level
    course_codes_by_level = {level: set() for level in PROGRAM_LEVELS.keys()}
    all_course_codes = set()
    
    # Process each program level
    levels_to_process = {filter_level: PROGRAM_LEVELS[filter_level]} if filter_level else PROGRAM_LEVELS
    
    for program_level, level_name in levels_to_process.items():
        print(f"\n{'='*60}")
        print(f"Processing {level_name} ({program_level})...")
        print(f"{'='*60}")
        
        # Fetch branch codes for this level
        print(f"Fetching branch codes for {level_name}...")
        branch_data = fetch_branch_codes(program_level)
        
        if not branch_data:
            print(f"No branch codes found for {level_name}, skipping...")
            continue
        
        course_codes = [item["dersBransKodu"] for item in branch_data]
        branch_ids = {item["dersBransKodu"]: item["bransKoduId"] for item in branch_data}
        
        # Filter by course codes if specified
        if filter_courses:
            course_codes = [code for code in course_codes if code in filter_courses]
            if not course_codes:
                print(f"No matching course codes found for {level_name} with filter: {filter_courses}")
                continue
            print(f"Filtered to {len(course_codes)} course codes: {', '.join(course_codes)}")
        
        # Add to level-specific and all course codes sets
        course_codes_by_level[program_level].update(course_codes)
        all_course_codes.update(course_codes)
        
        print(f"Found {len(course_codes)} course codes for {level_name}")
        
        # Process each course
        processed_count = 0
        for course_code in tqdm(course_codes, desc=f"Processing {level_name}"):
            branch_id = branch_ids[course_code]
            
            # Fetch course data
            df = fetch_course_data(program_level, branch_id)
            
            if df is None or len(df) == 0:
                continue  # Skip courses with no data
            
            # Save to CSV with level prefix (except LS for backward compatibility)
            # LS files keep original format, other levels get prefix
            if program_level == "LS":
                csv_path = os.path.join(FOLDER_PATH, DATE, f"{course_code}.csv")
            else:
                csv_path = os.path.join(FOLDER_PATH, DATE, f"{program_level}-{course_code}.csv")
            df.to_csv(csv_path, index=True)
            processed_count += 1
        
        print(f"Processed {processed_count} courses for {level_name}")
    
    # Export metadata JSON files
    folders = [f.name for f in os.scandir(FOLDER_PATH) if f.is_dir()]
    exportJson(os.path.join(FOLDER_PATH, "dates.json"), sorted(folders))
    
    # Export course codes (kept for backward compatibility)
    exportJson(os.path.join(FOLDER_PATH, "course_codes.json"), sorted(all_course_codes))
    
    # Export detailed breakdown by level (used by frontend)
    course_codes_by_level_data = {
        "all": sorted(all_course_codes),
        "by_level": {level: sorted(codes) for level, codes in course_codes_by_level.items() if codes}
    }
    with open(os.path.join(FOLDER_PATH, "course_codes_by_level.json"), "w") as f:
        json.dump(course_codes_by_level_data, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Completed! Data saved to {FOLDER_PATH}/{DATE}/")
    print(f"Total unique course codes: {len(all_course_codes)}")
    if filter_courses:
        print(f"Filtered courses: {', '.join(sorted(filter_courses))}")
    if filter_level:
        print(f"Filtered level: {PROGRAM_LEVELS[filter_level]} ({filter_level})")
    print(f"{'='*60}")
