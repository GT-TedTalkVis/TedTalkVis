import urllib.request
import pandas as pd

# Read original datafile
input = pd.read_csv("../src/data/ted_all.csv")

# Find NaNs
nans = pd.notna(input["thumbnail_url"])

# Keeps track of all thumbnail paths
thumbnail_paths = []

# Download the images
for i in range(input.shape[0]):
    if nans[i]:
        out_dir = "../src/public/images/thumbnails/"
        filename = "thumbnail_" + str(i) + ".jpg"
        output = out_dir + filename
        urllib.request.urlretrieve(input.at[i, "thumbnail_url"], output)
        thumbnail_paths.append(filename)
    else:
        thumbnail_paths.append("")
    i += 1
    if i % 100 == 0:
        print("Downloaded " + str(i) + " images.")
print("Finished downloading")

# Update ted_all.csv
input["thumbnail_path"] = thumbnail_paths
input.to_csv("../src/data/ted_all.csv")
