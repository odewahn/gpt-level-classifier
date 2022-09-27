# Local testing

Uses the Google `functions-framework` and `npm-watch`:

Local testing with hot reload:

```
npm start watch
```

Note that chrome will complain about not using HTTPS, and it doesn't seem like the `functions-framework` can do provide that. So, I'm using:

https://github.com/cameronhunter/local-ssl-proxy

```
npm install -g local-ssl-proxy

local-ssl-proxy --source 8081 --target 8080
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
