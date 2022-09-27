# Local testing

Uses the Google `functions-framework` and `npm-watch`:

Local testing with hot reload:

```
npm start watch
```

### Deploy as a cloud function

```
gcloud functions deploy eli5 --runtime=nodejs12 --trigger-http --entry-point eli5
```

Don't forget to also [set the secrets in the cloud function](https://cloud.google.com/functions/docs/configuring/env-var):

```
gcloud functions deploy eli5 --set-env-vars \
   PASSWORD=<THE-PASSWORD>,OPENAI_API_KEY=<THE-OPENAI-KEY>
```
