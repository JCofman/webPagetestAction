FROM node:slim

# A bunch of `LABEL` fields for GitHub to index
LABEL "com.github.actions.name"="WebPageTestActions"
LABEL "com.github.actions.description"="Print webPagetest.org results"
LABEL "com.github.actions.icon"="zap"
LABEL "com.github.actions.color"="white"
LABEL "repository"="https://github.com/JCofman/webPagetestAction"
LABEL "homepage"="https://github.com/JCofman/webPagetestAction"
LABEL "maintainer"="Jacob Cofman <cofman.jacob@gmail.com>"

# Copy over project files
COPY . .

# Install dependencies
RUN npm install

# This is what GitHub will run
ENTRYPOINT ["node", "/index.js"]
