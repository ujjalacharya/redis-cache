const express = require("express");
const axios = require("axios");
const redis = require("redis");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

const getRepos = async (req, res) => {
  try {
    const { username } = req.params;

    const resp = await axios.get(`https://api.github.com/users/${username}`);

    return res.json(resp.data.public_repos);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error");
  }
};

app.get("/repos/:username", getRepos);

app.listen(PORT, () => {
  console.log(`App started at port ${PORT}`);
});
