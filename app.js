const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqLite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      fiename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3009, () => {
      console.log('Server Running at http://localhost:3009/')
    })
  } catch (e) {
    console.log(`DB Errror: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jersyNumber: dbObject.jersy_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getCricketQuery = `
  SELECT 
  *
  FROM 
  cricket_team;`
  const cricketArray = await db.all(getCricketQuery)
  response.send(
    cricketArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jersyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO 
  cricket_team(playerName, jersyNumber, role)
  VALUES(
    '${playerName}',
    ${jersyNumber},
    '${role}'
  );`

  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const getPlayerQuery = `
  SELECT 
  *
  FROM 
  cricket_team
  WHERE 
  player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jersyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE
  cricket_team
  SET 
  player_name = '${playerName}'
  jersy_number = ${jersyNumber}
  role ='${role}'
  WHERE 
  player_id = ${playerId};`
  await db.run(getPlayerQuery)
  response.send('Player Details Updated')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getDeletePlayerQuery = `
  DELETE FROM
  cricket_team
  WHERE 
  player_id = ${playerId};`
  await db.run(getDeletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
