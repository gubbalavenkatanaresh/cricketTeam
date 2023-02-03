const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//list of all players

const convert = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
      SELECT
        *
      FROM
        cricket_Team`;
  const playersArray = await db.all(getPlayersQuery);

  response.send(playersArray.map((eachPlayer) => convert(eachPlayer)));
});

//creates a new player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
    INSERT INTO
      cricket_Team(player_id, player_name, jersey_number, role)
    VALUES
      (${playerName}, ${jerseyNumber}, ${role});`;

  const dbResponse = await db.run(createPlayerQuery);
  const newPlayerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

module.exports = app;
