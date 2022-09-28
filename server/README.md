# Overview

Customers frequently cite our lack of content levels (e.g., beginner, intermediate, advanced) as a significant reason they choose not to buy. While we have investigated various possibibilities for generating these level (ML models, Mechanical Turk, data from publishing partners), none has proven scalable enough to classify the full corpus of content.

This brief describes a new approach that uses OpenAI's GPT-3 as a classifier. The idea is that we would create a narrative description of rules or heuristics that would use as a classifier that we would provide to GPT-3, and then we would "ask" it to apply those rules to generate proposed level based on a given title. For example, a prompt might be:

```
I have a library of various learning materials consisting of books, courses and videos.  They
are geared to a technical audience, usually software developers, engineers, or
data scientists.  There are also some non-technical topics, like business or design.

I want to classify each of the following learning materials into one of the following
categories: beginner, intermediate, or advanced.

A beginner topic is one that is suitable for someone who is new to the topic.  It might
contain words like "introduction", "basics", "getting started", "fundamentals", or "tutorial".
Many of these will be on specific technical subjects, like "Python", "JavaScript", "React", "SQL", or "Linux

An advanced topic is one that is suitable for someone who has a lot of experience with the
topic.  It might contain words like "advanced", "expert", "advanced", or "mastering". These
are often on more advanced topics like "machine learning", "deep learning", "artificial intelligence", "architecture", "design patterns", or "data science".

An intermediate topic is one that is suitable for someone who has basic experience with the
topic but want to go furhter. If you're not sure if a topic is beginner or advanced, it's probably intermediate.

Here are a few examples of each type of topic:

Learning Go => beginner
Designing Data Intensive Applications => advanced
Head First Python => beginner
Clean Code Fundamentals => beginner
Fluent Python => intermediate
Advanced Mechanics of Materials and Applied Elasticity => advanced
Data Structures and Algorithms: The Materclass => advanced
The Art of Unit Testing => intermediate
An Agile Crash Course: Agile Project Management and Agile Delivery => intermediate
Building Microservices => advanced
User Experience Essentials => beginner
Practical Linear Algebra for Data Science => advanced

Given this, would you classify "Fundamentals of Python" as beginner, intermediate, or advanced?
```

The advantages of this approach are:

- _Minimal training data_. It does not require extensive training data to build a formal classifier. The need for thousands of samples has been a major impediment to prior efforts.
- _Intuitive_. This approach allows non-experts to tweak the model through "prompt engineering," which is the iterative process of refining the language in the until it provides the desired response accuracy.
- _Scalalable_. Once the prompt is providing the desired level of accuracy, we can easily apply it across the entire corpus of content.

## Process

Here's the business process:

- Develop the initial prompt
- Test the prompt by sampling various titles and rating the overall quality. This will require a UI/UX so for human-in-the-loop evaluation of the output
- Evaluate the failures in the model's predicitions, update the prompt, and iterate until it reaches a desired accuracy level
- compute the levels for the entire corpus

## Measuring process quality

We can use sampling to evaluate the quality of the prompt. For example, suppose we select N titles at random and have GPT3 assign them levels. We then have a human review all N and mark the ones that are inaccurate; call this number `f` for failure. A rough measure of the models accuracy is then:

accuracy = (N-f)/N

We can then tweak the prompt based on what we learn. For example, the prompt might consistently rate things as intermediate that should be advanced, or misclassify topics based on difficulty, or whatever. We'd then modify the prompt and rerun the sample until the accuracy is greater than 70% (or whatever threshold we choose.)

It will likely take a lot of trial and error to figure out how to tweak the prompt, so a clean UX for this process will be critical.

## Costs of classifying the full corpus

Once we got a prompt that yields an acceptable level of accuracy, we'll need to apply it to the full list of titles. Here are a few assumptions needed to estimate the costs for this:

- ~70,000 titles to classify
- ~300 tokens per prompt
- $0.02 / 1000 tokens (DaVinci model's current price)

So, the cost to classify the full catalog would be:

70,000 titles x 300 tokens per prompt x \$0.02 / 1,000 tokens = \$420

API costs for the prompt engineering phase would likely be minimal. The most likely cost there is the time and effort of the human testers.

# Proof of Concept

The project has two parts right now: a server and a client.

## Server

The `server` is a cloud function that submits a classification prompt that describe how to classify a work, along with the specific work to be classified. The function then returns the classification, either as JSON output or as an SVG image.

Here's the JSON format:

```

http GET http://localhost:8080/?format=json&title=Learning+go

{
"level": "beginner"
}

```

Here is the XML format:

```

http GET http://localhost:8080/?format=svg&title=Learning+go

  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
    ...
    <rect x="1" y="1" width="190" height="35" fill="gainsboro" filter="url(#dropshadow)" stroke="black" stroke-width="1" ry="20" rx="20"/>
    <text x="30" y="25" font-family="Arial, Helvetica, sans-serif">BEGINNER</text>
  </svg>
```

When testing, you can pass `debug=true` in the query string. This prevents the function from calling OpenAI, saving both time and money. The value returned is always `intermediate`.

## Client

# Development

## Server

Uses the Google `functions-framework` and `npm-watch`:

Local testing with hot reload [THIS IS NOT WORKING -- NOT SURE WHY]:

```
npm start watch
```

Note that chrome will complain about not using HTTPS when it tries to load the SVG. It doesn't seem like the `functions-framework` can do provide that. So, I'm using:

https://github.com/cameronhunter/local-ssl-proxy

```
npm install -g local-ssl-proxy
```

Once installed, run the proxy like this:

```
local-ssl-proxy --source 8081 --target 8080
```

In dev, the URL for the image in the chrome extension then points to:

`https://localhost:8081?format=svg&title=${title}`

## Client

Currently, the client is vanilla javascript that manipulates the DOM. So, there is no real build step or configuration. To use it:

- Go to `chrome://extensions`
- Turn on developer mode
- Click `Load Unpacked` and select the `./client` subfolder
- Reload the extension whenever you make changes

# Deploying

The classifier is deployed as a cloud function, like this:

```
gcloud functions deploy gpt3_content_level_classifier \
   ----allow-unauthenticated \
   --project=gpt3-experiments-sparktime \
   --runtime=nodejs12 \
   --trigger-http  \
   --entry-point gpt3_content_level_classifier \
   --set-env-vars \
   OPENAI_API_KEY=<THE KEY>

```

You can also [set the secrets in the cloud function console](https://cloud.google.com/functions/docs/configuring/env-var).

# To Do

- [x] Do cost estimates for the full corpus
- [ ] Fix hot reload for `npm watch`
- [ ] Cache results in google memory store
- [ ] Cache prompt in memory store and load it on each invocation of the model
- [ ] Move prompt to its own repo and then use a webhook to post it to memeorystore when it is changed. Be sure to also push the SHA of the repo so that you can know what version of the prompt is used
- [ ] Write product brief
- [ ] Develop a sampling plan and a way to measure quality control of the prompt
- [ ] Develop an API that combines the product metadata (especially ourn) with the prediction. This API should also have a way for someone to manualy override a prediciton in a way that is sticky across different applications of the model.
