const express = require("express");
const axios = require("axios");
const redis = require("redis");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

const setResponse = (username, repos) => {
  return `<h2>${username} has ${repos} repositories...</h2>`;
};

const getRepos = async (req, res) => {
  try {
    console.log("Fetching data");

    const { username } = req.params;

    const resp = await axios.get(`https://api.github.com/users/${username}`);

    const repos = resp.data.public_repos;

    // Set data to Redis
    client.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error");
  }
};

// Cache middleware
const cache = (req, res, next) => {
  const { username } = req.params;

  client.get(username, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
};

app.get("/repos/:username", cache, getRepos);

app.listen(PORT, () => {
  console.log(`App started at port ${PORT}`);
});
