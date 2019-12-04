import PIL
from PIL import Image
import pandas as pd

width = 120
height = 90

main_file = pd.read_csv("../src/data/ted_all.csv")
image_folder = "../src/public/images/thumbnails/"

for thumbnail in main_file["thumbnail_path"]:
    img = Image.open(image_folder + thumbnail)
    img = img.resize((width, height), PIL.Image.ANTIALIAS)
    img.save(image_folder + thumbnail)
