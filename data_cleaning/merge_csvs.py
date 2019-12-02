import pandas as pd

output_file_path = "../src/data/ted_all.csv"
main_file_path = "../src/data/ted_main_grouped_professions.csv"
fk_scores_file_path = "../data_crunching/ted_main_fk_scores.csv"
pop_file_path = "../data_crunching/all_popularity_metrics.csv"

mainFile = pd.read_csv(main_file_path)
fkFile = pd.read_csv(fk_scores_file_path)
popFile = pd.read_csv(pop_file_path)

fkFile = fkFile.sort_values(by="name")
mainFile = mainFile.sort_values(by="name")
popFile = popFile.sort_values(by="name")

mainFile["fk_score"] = fkFile["fk_score"]
mainFile["ted_views"] = popFile["ted_views"]
mainFile["ted_comments"] = popFile["ted_comments"]
mainFile["ted_engagement"] = popFile["ted_engagement"]
mainFile["ted_positivity"] = popFile["ted_positivity"]
mainFile["yt_views"] = popFile["yt_views"]
mainFile["yt_comments"] = popFile["yt_comments"]
mainFile["yt_engagement"] = popFile["yt_engagement"]
mainFile["yt_positivity"] = popFile["yt_positivity"]
mainFile["agg_views"] = popFile["agg_views"]
mainFile["agg_comments"] = popFile["agg_comments"]
mainFile["agg_engagement"] = popFile["agg_engagement"]
mainFile["agg_positivity"] = popFile["agg_positivity"]

mainFile = mainFile.sort_values(by="published_date")

mainFile.to_csv(output_file_path)
