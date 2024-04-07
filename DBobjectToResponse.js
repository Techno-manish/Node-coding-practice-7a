function conertPlayerDetails(DBobject) {
  return {
    playerId: DBobject.player_id,
    playerName: DBobject.player_name,
  }
}

function conertMatchDetails(DBobject) {
  return {
    matchId: DBobject.match_id,
    match: DBobject.match,
    year: DBobject.year,
  }
}

function conertPlayerMatchDetails(DBobject) {
  return {
    playerId: DBobject.player_id,
    playerName: DBobject.player_name,
    totalScore: DBobject.totalScore,
    totalFours: DBobject.totalFours,
    totalSixes: DBobject.totalSixes,
  }
}

exports.conertPlayerDetails = conertPlayerDetails
exports.conertMatchDetails = conertMatchDetails
exports.conertPlayerMatchDetails = conertPlayerMatchDetails
