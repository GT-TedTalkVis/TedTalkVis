import pandas as pd
import numpy as np
import json
import datetime
from ast import literal_eval

in_file_name = '../src/data/ted_main.csv'
out_file_name = '../src/data/tag_frequency_by_year.json'

# Read in the data
main_file = pd.read_csv(in_file_name, converters={"tags": literal_eval})

# Separate the talks into years, indexing by row number
talk_rows_by_year = {}
for i in range(main_file.shape[0]):
    talk_year = datetime.datetime.utcfromtimestamp(main_file.at[i, 'published_date']).year
    if talk_year in talk_rows_by_year:
        talk_rows_by_year[talk_year].append(i)
    else:
        talk_rows_by_year[talk_year] = [i]

# Count each tag for each years
# tag_counts_by_year: { year: {tag: frequency} }
tag_counts_by_year = {}
for year, rows in talk_rows_by_year.items():
    for row in rows:
        if year not in tag_counts_by_year.keys():
            tag_counts_by_year[year] = {}
        tags = main_file.at[row, "tags"]
        for tag in tags:
            if tag in tag_counts_by_year[year].keys():
                tag_counts_by_year[year][tag] += 1
            else:
                tag_counts_by_year[year][tag] = 1

for year, tags in tag_counts_by_year.items():
    tag_counts_by_year[year] = sorted(tags.items(), key=lambda x:x[1], reverse=True)

# Save output file
out_file = open(out_file_name, "w+")
out_file.write(json.dumps(tag_counts_by_year))
out_file.close()

# Print out top 5 tags for each year
for year, tags in tag_counts_by_year.items():
    print("\n", year)
    i = 1
    for tag, frequency in tag_counts_by_year[year][:10]:
        if tag != "TEDx" and tag != "TED Fellows":
            print("\t", i, "-", tag, ":", frequency)
            i += 1
        if i == 6:
            break
