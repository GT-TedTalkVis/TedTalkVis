import pandas as pd
import sys

datafile_path = "../src/data/ted_main_grouped_professions.csv"
output_path = "../src/data/profession_counts.csv"

print("Running...")

# Open data file
try:
	data = pd.read_csv(datafile_path)
except FileNotFoundError:
	sys.exit("Could not find file: \"" + datafile_path + "\"")

# Get counts for each profession and save them in a dataframe
profession_counts = data['grouped_occupation'].value_counts()
professions = profession_counts.index.tolist()
counts = profession_counts.values.tolist()

# Output csv with profession counts
output_frame = pd.DataFrame({'profession': professions, 'count': counts})
output_frame.to_csv(output_path, index=False)

print("Done")
