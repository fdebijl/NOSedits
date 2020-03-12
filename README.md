# [NOSedits](https://twitter.com/nosedits)
Track changes to titles in NOS articles
<br><br>
### How does it work?
NOSEdits receives title changes from [OpenTitles](https://github.com/Fdebijl/OpenTitles.Scraper). These are checked for validity, once they pass all the tests a tweet is issued that the title has been changed.
<br><br>
### Technical Details
NOSEdits uses Express to listen for POST requests on `localhost:7676/notify`. Once a request is received it will be checked for validity by `/src/util/validateArticle.ts`. If this method passes, it will be passed on to `/src/twitter/sendTweet.ts` to issue a Tweet for this article. Most checks are self-contained, but to make sure double-posting doesn't happen we also keep track of all Tweets via MongoDB. This database contains all previously issued Tweets with the old title, the new title and the Tweet (formally called a status) as returned by the Twitter API.
<br><br>
### Building and running
Either locally with dotenv and Node:
```sh
npm ci
node -r dotenv/config dist/index.js
```

Or by using the Dockerfile:
```sh
docker image build -t fdebijl/nosedits .
docker container run --publish 7676:7676 --detach --name nosedits fdebijl/nosedits
```

You will need a set of API keys from Twitter in order to actually send out a Tweet when a changed title is detected. You can get these from the [Twitter Developer](https://developer.twitter.com/en/apply-for-access) site. These keys are picked up from the following environment variables:
```
CONSUMER_KEY
CONSUMER_SECRET
ACCESS_TOKEN
ACCESS_TOKEN_SECRET
```
dotenv is included as a devDependency, it is recommended to use a `.env` file for local testing.
<br><br>
### Testing
```sh
npm ci
npm run test
```

A report will be output to `/test/report`. Due to some peculiarities with Typescript, the tests are located under `/test/src`, but executed as plain Javascript from `/test/compiled`.
