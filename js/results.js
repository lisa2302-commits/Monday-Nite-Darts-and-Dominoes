
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

const SUPABASE_URL =
  "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";


window.loadLeagueTable = async function () {

  const table = document.getElementById("leagueTable");

  if (!table) {
    console.error("leagueTable element not found");
    return;
  }

  table.innerHTML = `
    <tr>
      <td colspan="4">Loading table...</td>
    </tr>
  `;

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/results?select=fixture,home_score,away_score,week",
      {
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

    console.log("TABLE RESULTS:", results);

    const data = {};

    teams.forEach(team => {

      data[team] = {
        played: 0,
        points: 0
      };

    });

    results.forEach(result => {

      if (!result.fixture) return;

      const parts = result.fixture.split(" v ");

      if (parts.length !== 2) return;

      const home = parts[0].trim();
      const away = parts[1].trim();

      if (!data[home] || !data[away]) {
        console.warn("Team not recognised:", result.fixture);
        return;
      }

      const homeScore = Number(result.home_score);
      const awayScore = Number(result.away_score);

      if (
        Number.isNaN(homeScore) ||
        Number.isNaN(awayScore)
      ) {
        return;
      }

      data[home].played++;
      data[away].played++;

      data[home].points += homeScore;
      data[away].points += awayScore;

    });

    const sortedTeams =
      Object.entries(data).sort((a, b) => {

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

    console.log("TABLE UPDATED");

  } catch (error) {

    console.error("League table error:", error);

    table.innerHTML = `
      <tr>
        <td colspan="4">
          ❌ Unable to load league table
        </td>
      </tr>
    `;

  }

};

window.loadLeagueTable();
