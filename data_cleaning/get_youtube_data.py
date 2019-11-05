import os
import json
import googleapiclient.discovery
import numpy as np
import pandas as pd
import argparse
from progress.bar import Bar

API_KEY = json.load(open('../apikey.json'))["YOUTUBE"]

# load data
data_path = '../src/data/'
transcript_data_file = 'ted_main.csv'
data = pd.read_csv(data_path + transcript_data_file)

# Argument parser
parser = argparse.ArgumentParser()
parser.add_argument("start", type=int, help="starting index (inclusive)")
parser.add_argument("end", type=int, help="ending index(exclusive)")

args = parser.parse_args()

start = args.start
end = args.end if args.end <= len(data.index) else len(data.index)

# https://developers.google.com/youtube/v3/docs/search/list?apix=true
def searchYouTube(query):
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    api_service_name = "youtube"
    api_version = "v3"
    DEVELOPER_KEY = API_KEY

    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey = DEVELOPER_KEY)

    request = youtube.search().list(
        part="snippet",
        maxResults=3,
        order="relevance",
        q=query,
        type="video"
    )
    response = request.execute()
    return response

# https://developers.google.com/youtube/v3/docs/videos/list
def getVideoStatistics(videoId):
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    api_service_name = "youtube"
    api_version = "v3"
    DEVELOPER_KEY = API_KEY

    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey = DEVELOPER_KEY)

    request = youtube.videos().list(
        part="statistics",
        id=videoId
    )
    response = request.execute()

    return response

def getYouTubeData(query):
    search_result = searchYouTube(query) # Returns top 3 results
    search_result['originalQuery'] = query

    for i in range(len(search_result['items'])):
        videoId = search_result['items'][i]['id']['videoId']
        stats = getVideoStatistics(videoId)
        search_result['items'][i]['stats'] = stats
        
    return search_result

results = []
with Bar('Processing', max = len(range(start, end)), fill = '*', suffix = '%(percent).1f%% - %(eta)ds') as bar: 
    for i in range(start, end):
        video_name = data["name"].values[i].replace("-", " ").replace("|", " ")
        # print(video_name)
        # Clean up video name to remove - and | because those are youtube search modifiers
        result = getYouTubeData(video_name)
        results.append(result)
        bar.next()
print("Finished")

with open('video_data_' + str(start) + '_' + str(end) +'.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=4)