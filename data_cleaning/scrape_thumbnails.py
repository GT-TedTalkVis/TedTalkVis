import requests
from bs4 import BeautifulSoup
import json
import numpy as np
import pandas as pd
import argparse
import time
import random
from progress.bar import Bar

def scrapePage(url: str):
    page = requests.get(url)
    # Create a BeautifulSoup object
    soup = BeautifulSoup(page.content, 'html.parser')
    tag = soup.find('script', attrs={"data-spec":"q"})
    tag = str(tag)
    start = tag.find('{"el"')
    end = tag.find('})', start) + 1
    if start == -1 or end == -1:
        print("Failed to parse URL: " + url)
        return np.NaN, np.NaN
    j = tag[start:end]
    j = json.loads(j)
    speaker_data = j['__INITIAL_DATA__']['speakers']
    thumbnail = j['__INITIAL_DATA__']['talks'][0]['hero']
    return speaker_data, thumbnail


if __name__ == "__main__":
    # Load csv
    data_path = '../src/data/'
    data_file = 'ted_main_new.csv'
    data = pd.read_csv(data_path + data_file)
    
    # Argument parser
    parser = argparse.ArgumentParser()
    parser.add_argument("start", type=int, help="starting index (inclusive)")
    parser.add_argument("end", type=int, help="ending index(exclusive)")

    args = parser.parse_args()

    start = args.start
    end = args.end if args.end <= len(data.index) else len(data.index)
    
    speaker_data, thumbnail = scrapePage("https://www.ted.com/talks/tashka_and_laura_yawanawa_the_amazon_belongs_to_humanity_let_s_protect_it_together")
    count = 1
    with Bar('Processing', max = len(range(start, end)), fill = '*', suffix = '%(percent).1f%% - %(eta)ds') as bar: 
        for i in range(start, end):
            url = data.loc[i, "url"]
            speaker_data, thumbnail = scrapePage(url)
            data.loc[i, "speaker_data"] = str(speaker_data)
            data.loc[i, "thumbnail"] = str(thumbnail)
            if count % 10 == 0:
                data.to_csv(data_path + data_file)
            count += 1
            bar.next()
            time.sleep(6 + random.randint(-1, 3))
    data.to_csv(data_path + data_file)

    # page = requests.get("https://www.ted.com/talks/chris_anderson_of_wired_on_tech_s_long_tail")
    # soup = BeautifulSoup(page.content, 'html.parser')
    # tag = soup.find('script', attrs={"data-spec":"q"})
    # tag = str(tag)
    # print(tag)
