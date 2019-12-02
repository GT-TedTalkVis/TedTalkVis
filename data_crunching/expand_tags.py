import pandas as pd
import numpy as np
from ast import literal_eval

print ('Loading data file...')
main_file = pd.read_csv("../src/data/ted_all.csv", converters={"tags": literal_eval})
out_file_path = "../src/data/talk_tags.csv"
print ('Data file loaded')

# Get a list of all possible tags
print ('Finding all tags...')
masterTagList = main_file["tags"]
tags = ["talk_name"]
for tagList in masterTagList:
    for tag in tagList:
        if tag not in tags:
            tags.append(tag)
print ("Tags found")

# Create output dataframe
talkTagsList = pd.DataFrame(columns=tags)
print ("Created dataframe")

# Populate output dataframe
names = main_file["name"]
i = 0
for name in names:
    talk_tags = main_file.at[i, "tags"]
    talk_bools = [{"talk_name": main_file.at[i, "name"]}]
    for tag in tags:
        if tag in talk_tags and tag != "talk_name":
            talk_bools[0]["" + tag] = 1
        elif tag != "talk_name":
            talk_bools[0]["" + tag] = 0
    talkTagsList = talkTagsList.append(talk_bools, ignore_index=True)
    i += 1
    if i % 100 == 0:
        print (i)

print(talkTagsList)
talkTagsList.to_csv(out_file_path)
