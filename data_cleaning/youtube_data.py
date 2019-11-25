# %% Imports
import numpy as np
import pandas as pd
import os
import json
import googleapiclient.discovery

API_KEY = json.load(open('./apikey.json'))["YOUTUBE"]

# %% Load CSV file
wrong_videos = pd.read_csv("./data_cleaning/ted_youtube_similarity_wrong.csv")
ted_yt = pd.read_csv("./data_cleaning/ted_merged_yt.csv")


# %% YouTube search function
def searchYouTube(query):
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    api_service_name = "youtube"
    api_version = "v3"
    DEVELOPER_KEY = API_KEY

    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=DEVELOPER_KEY)

    request = youtube.search().list(  # pylint: disable=no-member
        part="snippet",
        maxResults=1,
        order="relevance",
        q=query,
        type="video"
    )
    response = request.execute()
    return response


def getVideoStatistics(videoId):
    # Disable OAuthlib's HTTPS verification when running locally.
    # *DO NOT* leave this option enabled in production.
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    api_service_name = "youtube"
    api_version = "v3"
    DEVELOPER_KEY = API_KEY

    youtube = googleapiclient.discovery.build(  # pylint: disable=no-member
        api_service_name, api_version, developerKey=DEVELOPER_KEY)

    request = youtube.videos().list(  # pylint: disable=no-member
        part="statistics",
        id=videoId
    )
    response = request.execute()

    return response


def getYouTubeData(query):
    search_result = searchYouTube(query)  # Returns top 3 results
    search_result['originalQuery'] = query

    for i in range(len(search_result['items'])):
        videoId = search_result['items'][i]['id']['videoId']
        stats = getVideoStatistics(videoId)
        search_result['items'][i]['stats'] = stats

    return search_result


# %% Perform searches on wrong_videos dataframe
results = []
for i in wrong_videos.index:
    print("Getting youtube data", i+1, "of", len(wrong_videos))
    videoLink = wrong_videos.loc[i, "manual_youtube_link"]

    # Skip row if we don't have a correct youtube link to search with.
    if type(videoLink) == float:
        if np.isnan(videoLink):
            results.append(None)
            continue

    results.append(getYouTubeData(videoLink))


# %%
for i in range(len(results)):
    tyRowID = wrong_videos.loc[i, "rowid"]
    print("Transfering result", i+1, "of", len(results))

    if results[i] is None:
        ted_yt.loc[tyRowID, "youtube_title"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_description"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_videoId"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_videoLink"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_viewCount"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_likeCount"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_dislikeCount"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_favoriteCount"] = np.NaN
        ted_yt.loc[tyRowID, "youtube_commentCount"] = np.NaN
    else:
        ted_yt.loc[tyRowID, "youtube_title"] = results[i]['items'][0]['snippet'].get(
            'title')
        ted_yt.loc[tyRowID, "youtube_description"] = results[i]['items'][0]['snippet'].get(
            'description')
        ted_yt.loc[tyRowID, "youtube_videoId"] = results[i]['items'][0]['id'].get(
            'videoId')
        ted_yt.loc[tyRowID, "youtube_videoLink"] = "https://www.youtube.com/watch?v=" + \
            results[i]['items'][0]['id'].get('videoId')
        ted_yt.loc[tyRowID, "youtube_publishedAt"] = results[i]['items'][0]['snippet'].get(
            'publishedAt')
        ted_yt.loc[tyRowID, "youtube_viewCount"] = results[i]['items'][0]['stats']['items'][0]['statistics'].get(
            'viewCount')
        ted_yt.loc[tyRowID, "youtube_likeCount"] = results[i]['items'][0]['stats']['items'][0]['statistics'].get(
            'likeCount')
        ted_yt.loc[tyRowID, "youtube_dislikeCount"] = results[i]['items'][0]['stats']['items'][0]['statistics'].get(
            'dislikeCount')
        ted_yt.loc[tyRowID, "youtube_favoriteCount"] = results[i]['items'][0]['stats']['items'][0]['statistics'].get(
            'favoriteCount')
        ted_yt.loc[tyRowID, "youtube_commentCount"] = results[i]['items'][0]['stats']['items'][0]['statistics'].get(
            'commentCount')


# %%
ted_yt.to_csv("./data_cleaning/ted_merged_yt_final.csv", index=False)

# %%
