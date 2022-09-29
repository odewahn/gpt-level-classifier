// Load environment variables from .env file
const dotenv = require("dotenv");
dotenv.config();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

console.log("Starting server...");

let PROMPT = `
I have a library of various learning materials, like books or videos.  They
are geared to a technical audience, usually software developers, engineers, or
data scientists.  There are also some non-technical topics, like business or design.

I'd want to classify each of the following learning materials into one of the following
categories: beginner, intermediate, advanced, or expert.

A beginner topic is one that is suitable for someone who is new to the topic.  It might
contain words like "introduction", "basics", "getting started", "fundamentals", or "tutorial".
Many of these will be on specific technical topics, like "Python", "JavaScript", "React", "SQL", or "Linux

An intermediate topic is one that is suitable for someone who has some experience with the
topic. If you're not sure if a topic is beginner or intermediate, it's probably intermediate.  

An advanced topic is one that is suitable for someone who has a lot of experience with the
topic.  It might contain words like "advanced", "expert", "advanced", or "mastering". These
are often on more advanced topics like "machine learning", "deep learning", "artificial intelligence",
"architecture", "design patterns", or "data science".

Finally, an expert topic is one that is suitable for someone who is an expert in the topic. It
might contain words like "advanced", "expert", "advanced", or "mastering". It might also be about
an inherently complex subject, like quantum physics or cryptography.

Here are a few examples of each type of topic:

Learning GO => beginner
Designing Data Intensive Applications => advanced
Head First Python => beginner
Clean Code Fundamentals => beginner
Fluent Python => intermediate
Advanced Mechanics of Materials and Applied Elasticity => expert
Data Structures and Algorithms: The Materclass => advanced
The Art of Unit Testing => intermediate
An Agile Crash Course: Agile Project Management and Agile Delivery => intermediate
Building Microservices => advanced
User Experience Essentials => beginner
Practical Linear Algebra for Data Science => expert
`;

function generateSVG(level) {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
    <defs>
      <filter id="dropshadow" height="130%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <!-- stdDeviation is how much to blur -->
        <feOffset dx="2" dy="2" result="offsetblur"/>
        <!-- how much to offset -->
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.5"/>
          <!-- slope is the opacity of the shadow -->
        </feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <!-- this contains the offset blurred image -->
          <feMergeNode in="SourceGraphic"/>
          <!-- this contains the element that the filter is applied to -->
        </feMerge>
      </filter>
    </defs>
    <rect x="1" y="1" width="190" height="35" fill="gainsboro" filter="url(#dropshadow)" stroke="black" stroke-width="1" ry="20" rx="20"/>
    <text x="30" y="25" font-family="Arial, Helvetica, sans-serif">${level.toUpperCase()}</text>
  </svg>
  `;
}

exports.gpt3_content_level_classifier = async (req, res) => {
  // Set CORS headers for preflight requests
  // Allows GETs from any origin with the Content-Type header
  // and caches preflight response for 3600s

  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else if (req.method === "GET") {
    // Set a convenience variable for the payload
    const format = req.query.format || "json";
    const title = req.query.title;
    const debug = req.query.debug || false;
    var prompt = PROMPT + title + " => ";

    try {
      let level = "intermediate";
      // Skip calling OpenAI if we're in debug mode
      if (!debug) {
        const completion = await openai.createCompletion({
          prompt: prompt,
          model: "text-davinci-002",
          temperature: 0,
          max_tokens: 10,
        });
        level = completion.data.choices[0].text.trim();
      }
      // Return the first message from the completion response and use as the response
      if (format === "svg") {
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(generateSVG(level));
      } else {
        res.json({ level: level });
      }
    } catch (error) {
      if (format === "svg") {
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(generateSVG("error"));
      } else {
        res.json({ level: "error" });
      }
    }
  } else {
    if (format === "svg") {
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(generateSVG("error"));
    } else {
      res.json({ level: "error" });
    }
  }
};
