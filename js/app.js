const teams = [
  "Crown A",
  "Punch",
  "ICI",
  "Golden Cup",
  "The Park Inn",
  "Bird in Hand",
  "Victoria A",
  "Two Gates Club",
  "Funky Room",
  "Entwistle",
  "Crown B",
  "Victoria B"
];

function loadLeagueTable() {

  const table = document.getElementById("leagueTable");

  if (!table) return;

  const results =
    JSON.parse(localStorage.getItem("results")) || [];

  const data = {};

  teams.forEach(team => {
  data[team] = {
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  points: 0
};
  });

  results.forEach(result => {

  const homeScore = Number(result.homeScore) || 0;
  const awayScore = Number(result.awayScore) || 0;

  data[result.home].played++;
  data[result.away].played++;

  data[result.home].points += homeScore;
  data[result.away].points += awayScore;

  if (homeScore > awayScore) {
    data[result.home].wins++;
    data[result.away].losses++;
  }

  if (awayScore > homeScore) {
    data[result.away].wins++;
    data[result.home].losses++;
  }
if (homeScore === awayScore) {
  data[result.home].draws++;
  data[result.away].draws++;
}
});

  const sortedTeams = Object.entries(data).sort((a, b) => {

    // 1. Points
    if (b[1].points !== a[1].points) {
      return b[1].points - a[1].points;
    }

    // 2. Games won
    if (b[1].wins !== a[1].wins) {
      return b[1].wins - a[1].wins;
    }

    // 3. Team name
    return a[0].localeCompare(b[0]);

  });

  table.innerHTML = "";

  sortedTeams.forEach((team, index) => {

    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${team[0]}</td>
        <td>${team[1].played}</td>
<td>${team[1].wins}</td>
<td>${team[1].draws}</td>
<td>${team[1].losses}</td>
<td>${team[1].points}</td>
    
      </tr>
    `;

  });
}

loadLeagueTable();