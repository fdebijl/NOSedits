# [NOSedits](https://twitter.com/nosedits)
Track changes to titles in NOS articles
<br><br>
### How does it work?
NOSEdits receives title changes from [OpenTitles](https://github.com/Fdebijl/OpenTitles.Scraper). These are checked for validity, once they pass all the tests a tweet is issued that the title has been changed.
<br><br>
### Technical Details
NOSEdits uses AMQP to listen for title changes dispatched by OpenTitles. Once a message is received it will be checked for validity by `/src/util/validateArticle.ts`. If this method passes, it will be passed on to `/src/twitter/sendTweet.ts` to issue a Tweet for this article. Most checks are self-contained, but to make sure double-posting doesn't happen we also keep track of all Tweets via MongoDB. This database contains all previously issued Tweets with the old title, the new title and the Tweet (formally called a status) as returned by the Twitter API.
 
The deprecated WebhookListener uses Express to listen for POST requests on `localhost:7676/notify`, but otherwise uses the same validation methods that the AMQP listener uses.
<br><br>
### Building and running
Either locally with dotenv and Node:
```sh
npm ci
npm run compile
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
dotenv is included as a devDependency, it is recommended to use a `.env` file for local testing. See `/src/config.ts` for other relevant environment variables, such as the MongoDB connection string and RabbitMQ exchange URI.
<br><br>
### Testing
```sh
npm ci
npm run simpletest
# or 'npm run test' when collecting coverage
```
