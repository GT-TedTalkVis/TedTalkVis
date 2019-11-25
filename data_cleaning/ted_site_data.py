# %% Imports
import numpy as np
import pandas as pd
import os
import json
import ast

# %% Load CSV
site_data = pd.read_csv("./data_cleaning/ted_main_pagedata_unparsed.csv")
ted_merged = pd.read_csv("./data_cleaning/ted_merged_yt_final.csv")

# %%
for i in ted_merged.index:
    print("Parsing row ", i)
    data = site_data.loc[i, "page_data"]
    if pd.isna(data):
        continue
    data = ast.literal_eval(data)

    ted_merged.loc[i, "site_video_type"] = data['talks'][0]['video_type'].get(
        'name')
    ted_merged.loc[i, "thumbnail"] = data['talks'][0]['hero']

    # Get data on all speakers
    for s in range(len(data['speakers'])):
        ted_merged.loc[i, "speaker_firstname_" +
                       str(s)] = data['speakers'][s].get('firstname')
        ted_merged.loc[i, "speaker_lastname_" +
                       str(s)] = data['speakers'][s].get('lastname')
        ted_merged.loc[i, "speaker_description_" + str(s)] = data['speakers'][s].get(
            'description')
        ted_merged.loc[i, "speaker_whatotherssay_" + str(s)] = data['speakers'][s].get(
            'whatotherssay')
        ted_merged.loc[i, "speaker_whotheyare_" +
                       str(s)] = data['speakers'][s].get('whotheyare')
        ted_merged.loc[i, "speaker_whylisten_" +
                       str(s)] = data['speakers'][s].get('whylisten')


# %%
ted_merged.to_csv("./data_cleaning/ted_merged_site_yt.csv")
ted_merged.to_csv("./src/data/ted_merged_site_yt.csv")

# %%
