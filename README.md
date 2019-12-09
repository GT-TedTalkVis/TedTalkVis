# TedTalkVis

## Website
You can view the production version of the website at the following URL:
https://gt-tedtalkvis.github.io/TedTalkVis/
## Introduction
Repo for InfoVis F2019 project on Ted Talk Data. We obtained the data for this project from https://www.kaggle.com/rounakbanik/ted-talks

## Project Setup
Clone the repo and run `npm install` and you should be good to go.
The recommended IDE is VS Code since the project uses TypeScript, Prettier, and ESLint.

To run the development webserver, use `npm run start`. You can view the project at `localhost:8080` with hot reloading.

To compile the production build, use `npm run build`.

## Python
Mac
```
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
jupyter notebook
```

Windows
```
virtualenv venv
venv\Scripts\activate
pip install -r requirements.txt
jupyter notebook
```