
const SUPABASE_URL =
  "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";

window.loadLeagueTable = async function () {

  const table = document.getElementById("leagueTable");

  if (!table) {
    console.error("leagueTable not found");
    return;
  }

  table.innerHTML = `
    <tr>
      <td colspan="7">Loading table...</td>
    </tr>
  `;

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/results?select=fixture,home_score,away_score,week",
      {
        method: "GET",
        headers: {
          "apikey": SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        "Supabase returned " + response.status
      );
    }

    const results = await response.json();

    console.log("SUPABASE RESULTS:", results);

    const data = {};

    teams.forEach(team => {
      data[team] = {
        played: 0,
        points: 0
      };
    });

    results.forEach(result => {

      const scores = result.fixture.split(/\s+v\s+/);

      if (scores.length !== 2) return;

      const home = scores[0].trim();
      const away = scores[1].trim();

      const homeScore = Number(result.home_score) || 0;
      const awayScore = Number(result.away_score) || 0;
data[team] = {
  data[home].played++;
data[away].played++;

data[home].points += homeScore;
data[away].points += awayScore;
if (homeScore > awayScore) {
  data[home].wins++;
  data[away].losses++;
}

if (awayScore > homeScore) {
  data[away].wins++;
  data[home].losses++;
}

if (homeScore === awayScore) {
  data[home].draws++;
  data[away].draws++;
}
    const sortedTeams = Object.entries(data).sort((a, b) => {

      if (b[1].points !== a[1].points) {
        return b[1].points - a[1].points;
      }

      return a[0].localeCompare(b[0]);

    });

    table.innerHTML = "";

    sortedTeams.forEach((team, index) => {

      table.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${team[0]}</td>
          <td>${team[1].played}</td>
          <td>${team[1].points}</td>
        </tr>
      `;

    });

  } catch (error) {

    console.error("LEAGUE TABLE ERROR:", error);

    table.innerHTML = `
      <tr>
        <td colspan="7">
          Error loading league table
        </td>
      </tr>
    `;
  }
};

window.loadLeagueTable();
