import pandas as pd
import json
from ast import literal_eval
import sys

datafile_path = "../src/data/ted_main_grouped_professions.csv"
output_path = "../src/data/topic_relationships.json"

print("Running...")

# Open data file
try:
	data = pd.read_csv(datafile_path, converters={"tags": literal_eval})
except FileNotFoundError:
	sys.exit("Could not find file: \"" + datafile_path + "\"")

masterTagList = data["tags"]
relationships = {}

count = 0
for talkTagList in masterTagList:
	for tag in talkTagList:
		if tag not in relationships:
			relationships[tag] = {}
		for related in talkTagList:
			if related != tag:
				if related not in relationships[tag]:
					relationships[tag][related] = 0
				relationships[tag][related] += 1
	if count % 100 == 0:
		print(count, "completed")
	count += 1

json = json.dumps(relationships)
out = open(output_path, "w+")
out.write(json)
out.close()

print("Done")
