import numpy as np
import pandas as pd
from scipy import stats
from sklearn import tree
from sklearn.preprocessing import OneHotEncoder
import matplotlib.pyplot as plt
from subprocess import call
import time

### Global Variables ###

# The path to the main data file
main_file_path = "../src/data/ted_all.csv"

# The path to the tags data for each talk_name
tags_path = "../src/data/talk_tags.csv"

### The following functions come from my implementation of a Machine Learning assignment. ###

def entropy(class_y):
    bins = np.bincount(class_y)
    probs = bins / len(class_y)
    return stats.entropy(probs, base=2)

def information_gain(previous_y, current_y):
    H = entropy(previous_y)
    H_left = entropy(current_y[0])
    H_right = entropy(current_y[1])
    P_left = len(current_y[0]) / len(previous_y)
    P_right = len(current_y[1]) / len(previous_y)
    return H - (H_left * P_left + H_right * P_right)

def partition_classes(X, y, split_attribute, split_val):
    # Get type of split attribute
    is_numeric = isinstance(X[0][split_attribute], int) \
                 or isinstance(X[0][split_attribute], float)

    X = np.array(X)
    y = np.array(y)
    # Numeric split
    if is_numeric:
        A_indices = np.argwhere(X[:, split_attribute].astype(np.float) <= split_val)[:, 0]
        B_indices = np.argwhere(X[:, split_attribute].astype(np.float) > split_val)[:, 0]
        A = X[A_indices]
        A_y = y[A_indices]
        B = X[B_indices]
        B_y = y[B_indices]
    # Categorical split
    else:
        A = X[X[:, split_attribute] == split_val]
        A_y = y[X[:, split_attribute] == split_val]
        B = X[X[:, split_attribute] != split_val]
        B_y = y[X[:, split_attribute] != split_val]

    return A, B, A_y, B_y

def find_best_split(X, y, split_attribute):
    # Get type of split attribute
    is_numeric = isinstance(X[0][split_attribute], int) \
                 or isinstance(X[0][split_attribute], float)

    # Find all unique values in the split attribute
    vals = np.unique(np.array(X)[:, split_attribute])

    # Find the best split value
    best = 0
    I = -1
    for v in vals:
        if is_numeric:
            v = float(v)
        X_left, X_right, y_left, y_right = partition_classes(X, y, split_attribute, v)
        i_gain = information_gain(y, [y_left, y_right])
        if i_gain > I:
            I = i_gain
            best = v
    return best, I

def sort_key(e):
    return e[2]

def find_best_feature(X, y, n):
    """
    Best features in the form [feature, value, info_gain]
    """
    best_features = []
    for i in range(n):
        best_features.append([-1, -1, -1])
    for i in range(len(X[0])):
        val, gain = find_best_split(X, y, i)
        if gain > best_features[n - 1][2]:
            best_features.append([i, val, gain])
            best_features.sort(key=sort_key, reverse=True)
            best_features.pop()
    return best_features

### The following section is my application of the Machine Learning functions to our needs. ###

def assign_popularity_groupings(raw_metric):
    """
    Groups the raw popularity metric into 3 bins, as lower, middle, and upper third.
    """
    metric = np.array(raw_metric)
    lowerThird = np.percentile(metric, 33)
    upperThird = np.percentile(metric, 66)
    groupings = np.where(metric <= lowerThird, 0, np.where(metric <= upperThird, 0, 1))
    return groupings

# Read in the data
print("Reading main file")
main_file = pd.read_csv(main_file_path).fillna(0)
print("Finished reading main file")
print("Reading tegs file")
tags_file = pd.read_csv(tags_path).fillna(0)
print("Finished reading main file")

# Get the different evaluation methods
agg_views = assign_popularity_groupings(main_file["ted_views"].tolist())
agg_comments = assign_popularity_groupings(main_file["ted_comments"].tolist())
agg_engagement = assign_popularity_groupings(main_file["ted_engagement"].tolist())
agg_positivity = assign_popularity_groupings(main_file["ted_positivity"].tolist())

# In this set I use the following features
#   0 - duration
#   1 - event
#   2 - languages
#   3 - main_speaker
#   4 - num_speakers
#   5 - grouped occupation
#   6 - reading level analysis
#   7 and on - tags

# First 5 features
print("Building basic dataframe")
features = pd.DataFrame(main_file["duration"])
features["event"] = main_file["event"]
features["languages"] = main_file["languages"]
features["main_speaker"] = main_file["main_speaker"]
features["num_speaker"] = main_file["num_speaker"]
features["fk_score"] = main_file["fk_score"]

# Remaining tag features
print ("Adding tags to dataframe...")
tags = tags_file[tags_file.columns[2:len(tags_file.columns)]]
#features = tags.copy()
features = pd.concat([features, tags], sort=False, axis=1)
print ("Dataframe complete")

# Encode categorical data
print("Encoding categorical data")
encoded_features = features.copy()
encoded_features['event'] = pd.factorize(encoded_features.event)[0]
encoded_features['main_speaker'] = pd.factorize(encoded_features.main_speaker)[0]
print("Finished encoding")

# Create decision tree
print("Fitting decision tree...")
model = tree.DecisionTreeClassifier(max_depth=6)
model.fit(encoded_features, agg_views)
print("Tree fitted")
print("Exporting visual")
tree.export_graphviz(model, out_file='tree.dot', feature_names=features.columns, rounded=True, filled=True)
time.sleep(0.25)
call(['dot', '-T', 'png', 'tree.dot', '-o', 'tree.png'])
print("Done")

"""
# Find features with the highest explained variance
n_features = 5
print ("Finding best features for aggragate views...")
best = find_best_feature(features.values.tolist(), agg_views, n_features)
print(best)
print("Best features for aggragate views:")
for i in range(n_features):
    #print("   ", i, ":", features.columns[best[i][0]], "with a split value of", best[i][1])
    print("   ", i, ":", features.columns[best[i][0]])

print ("Finding best features for aggragate comments...")
best = find_best_feature(features.values.tolist(), agg_comments, n_features)
print("Best features for aggragate comments:")
for i in range(n_features):
    #print("   ", i, ":", features.columns[best[i][0]], "with a split value of", best[i][1])
    print("   ", i, ":", features.columns[best[i][0]])

print ("Finding best features for aggragate engagement...")
best = find_best_feature(features.values.tolist(), agg_engagement, n_features)
print("Best features for aggragate engagement:")
for i in range(n_features):
    #print("   ", i, ":", features.columns[best[i][0]], "with a split value of", best[i][1])
    print("   ", i, ":", features.columns[best[i][0]])

print ("Finding best features for aggragate positivity...")
best = find_best_feature(features.values.tolist(), agg_positivity, n_features)
print("Best features for aggragate positivity:")
for i in range(n_features):
    #print("   ", i, ":", features.columns[best[i][0]], "with a split value of", best[i][1])
    print("   ", i, ":", features.columns[best[i][0]])
"""
