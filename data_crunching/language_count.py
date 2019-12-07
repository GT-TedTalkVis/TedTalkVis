# %% Imports
import numpy as np
import pandas as pd
import ast

df = pd.read_csv("./data_cleaning/ted_main_pagedata_unparsed.csv")

# %% Eval crazy column
page_data = []
for i in df.index:
    print(i)
    if df.loc[i, "page_data"] is np.nan:
        page_data.append([])
        continue
    evaluated = ast.literal_eval(df.loc[i, "page_data"])
    languages = evaluated['talks'][0]['downloads']['languages']
    langs = []
    for l in range(len(languages)):
        langs.append(languages[l]['languageName'])
    page_data.append(langs)


# %%
for i in df.index:
    df.loc[i, "available_languages"] = str(page_data[i])

# %%
ted_all = pd.read_csv("./src/data/ted_all.csv")

# %%
ted_all.keys()

# %%
for i in df.index:
    df.loc[i, "newInd"] = np.argwhere(
        ted_all.loc[:, "name"] == df.loc[i, "name"]).item()

# %%
df["newInd"] = df["newInd"].astype(int)

# %%
for i in df.index:
    targetInd = df.loc[i, "newInd"]
    ted_all.loc[targetInd, "available_languages"] = df.loc[i,
                                                           "available_languages"]

# %%
df.loc[0, "available_languages"]

# %%
ted_all.to_csv("ted_all.csv", index=False)

# %%
