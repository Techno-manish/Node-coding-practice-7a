const express = require('express')
const path = require('path')

const {
  conertPlayerDetails,
  conertMatchDetails,
  conertPlayerMatchDetails,
} = require('./DBobjectToResponse.js')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

const PORT = 3000

db = null

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`)
    })
  } catch (e) {
    console.log(`Error: ${e}`)
    process.exit(1)
  }
}
initializeDBandServer()

//API 1 Returns a list of all the players in the player table

app.get('/players/', async (request, response) => {
  const getPLayersQuery = `
  SELECT 
    *
  FROM
    player_details;
  `
  const players = await db.all(getPLayersQuery)
  response.send(players.map(eachPlayer => conertPlayerDetails(eachPlayer)))
})

//API 2 Returns a specific player based on the player ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPLayerQuery = `
  SELECT 
    *
  FROM
    player_details
  WHERE
    player_id = ${playerId}
  `
  const player = await db.get(getPLayerQuery)
  response.send(conertPlayerDetails(player))
})

//API 3 Updates the details of a specific player based on the player ID
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}'
  WHERE
    player_id = ${playerId};
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API 4 Returns the match details of a specific match
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuery = `
  SELECT 
    *
  FROM
    match_details
  WHERE
    match_id = ${matchId}
  `
  const match = await db.get(getMatchQuery)
  response.send(conertMatchDetails(match))
})

//API 5 Returns a list of all the matches of a player
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getPlayerMatchesQuery = `
  SELECT 
    match_details.match_id as match_id,
    match_details.match as match,
    match_details.year as year
  FROM
    match_details JOIN player_match_score ON match_details.match_id=player_match_score.match_id
  WHERE
    player_match_score.player_id = ${playerId};
  `
  const playerMatches = await db.all(getPlayerMatchesQuery)
  response.send(playerMatches.map(each => conertMatchDetails(each)))
})

//API 6 Returns a list of players of a specific match
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getMatchPlayersQuery = `
  SELECT 
    player_details.player_id as player_id,
    player_details.player_name as player_name
  FROM
    player_details JOIN player_match_score ON player_details.player_id=player_match_score.player_id
  WHERE
    player_match_score.match_id = ${matchId};
  `
  const matchPlayers = await db.all(getMatchPlayersQuery)
  response.send(matchPlayers.map(each => conertPlayerDetails(each)))
})

//API 7 Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const playerStatistics = `
  SELECT 
    player_details.player_id as player_id,
    player_details.player_name as player_name,
    SUM(player_match_score.score) as totalScore,
    SUM(player_match_score.fours) as totalFours,
    SUM(player_match_score.sixes) as totalSixes
  FROM
    player_details JOIN player_match_score ON player_details.player_id=player_match_score.player_id
  WHERE
    player_match_score.player_id = ${playerId};
  `
  const statistics = await db.get(playerStatistics)
  response.send(conertPlayerMatchDetails(statistics))
})

module.exports = app