const SUPABASE_URL =
  "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";


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


const fixturesTable =
  document.getElementById("fixturesTable");

const weekSelect =
  document.getElementById("weekSelect");

let fixtures = [];


// ============================
// GENERATE FIXTURES
// ============================

function generateFixtures() {

  fixtures = [];

  const list = [...teams];

  const lastVenue = {};
  const homeCount = {};

  teams.forEach(team => {
    lastVenue[team] = null;
    homeCount[team] = 0;
  });


  // =========================
  // WEEKS 1 - 11
  // =========================

  for (let week = 1; week <= 11; week++) {

    const pairs = [];

    for (let i = 0; i < 6; i++) {

      pairs.push([
        list[i],
        list[11 - i]
      ]);

    }


    let bestFixtures = null;
    let bestScore = Infinity;


    // There are only 64 possible
    // home/away combinations each week.
    // Try them all and choose the best one.

    for (let mask = 0; mask < 64; mask++) {

      const candidate = [];
      const homeTeams = new Set();

      for (let i = 0; i < 6; i++) {

        const team1 = pairs[i][0];
        const team2 = pairs[i][1];

        let home;
        let away;

        if (mask & (1 << i)) {

          home = team2;
          away = team1;

        } else {

          home = team1;
          away = team2;

        }

        candidate.push({
          week: week,
          home: home,
          away: away
        });

        homeTeams.add(home);

      }


      // Crown A and Crown B
      // must be opposite venues

      const crownAHome =
        homeTeams.has("Crown A");

      const crownBHome =
        homeTeams.has("Crown B");

      if (crownAHome === crownBHome) {
        continue;
      }


      // Victoria A and Victoria B
      // must be opposite venues

      const victoriaAHome =
        homeTeams.has("Victoria A");

      const victoriaBHome =
        homeTeams.has("Victoria B");

      if (
        victoriaAHome ===
        victoriaBHome
      ) {
        continue;
      }


      let score = 0;


      // Prefer alternating
      // home / away each week

      candidate.forEach(match => {

        if (
          lastVenue[match.home] === "H"
        ) {
          score += 100;
        }

        if (
          lastVenue[match.away] === "A"
        ) {
          score += 100;
        }

      });


      // Also keep the total number
      // of home matches balanced

      teams.forEach(team => {

        const newHomeCount =
          homeCount[team] +
          (
            homeTeams.has(team)
              ? 1
              : 0
          );

        const ideal =
          week / 2;

        score +=
          Math.abs(
            newHomeCount - ideal
          );

      });


      if (score < bestScore) {

        bestScore = score;
        bestFixtures = candidate;

      }

    }


    // Add the chosen fixtures

    bestFixtures.forEach(match => {

      fixtures.push(match);

      lastVenue[match.home] = "H";
      lastVenue[match.away] = "A";

      homeCount[match.home]++;

    });


    // Rotate teams for next week

    const last = list.pop();

    list.splice(
      1,
      0,
      last
    );

  }


  // =========================
  // WEEKS 12 - 22
  // REVERSE THE VENUES
  // =========================

  const firstHalf =
    [...fixtures];

  firstHalf.forEach(match => {

    fixtures.push({
      week: match.week + 11,
      home: match.away,
      away: match.home
    });

  });

}

// ============================
// LOAD WEEKS
// ============================

function loadWeeks() {

  weekSelect.innerHTML = "";

  for (let week = 1; week <= 22; week++) {

    weekSelect.innerHTML += `
      <option value="${week}">
        Week ${week}
      </option>
    `;

  }

  loadFixtures();

}


// ============================
// LOAD FIXTURES FROM SUPABASE
// ============================

async function loadFixtures() {

  const selectedWeek =
    Number(weekSelect.value);

  fixturesTable.innerHTML = `
    <tr>
      <td colspan="5">
        Loading fixtures...
      </td>
    </tr>
  `;

  try {

    const response = await fetch(
      SUPABASE_URL +
      `/rest/v1/results?select=fixture,home_score,away_score,week&week=eq.${selectedWeek}`,
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

    const results =
      await response.json();

    fixturesTable.innerHTML = "";


    fixtures
      .filter(
        fixture =>
          fixture.week === selectedWeek
      )
      .forEach(fixture => {

        const result =
          results.find(saved => {

            const teams =
              saved.fixture.split(/\s+v\s+/);

            if (teams.length !== 2) {
              return false;
            }

            const savedHome =
              teams[0].trim();

            const savedAway =
              teams[1].trim();

            return (
              Number(saved.week) ===
                fixture.week &&
              savedHome ===
                fixture.home &&
              savedAway ===
                fixture.away
            );

          });


        let status =
          "⚪ Not Played";

        let score = "-";


        if (result) {

          status =
            "🟢 Played";

          score =
            `${result.home_score} - ${result.away_score}`;

        }


        fixturesTable.innerHTML += `
          <tr>
            <td>
              Week ${fixture.week}
            </td>

            <td>
              ${fixture.home}
            </td>

            <td>
              ${fixture.away}
            </td>

            <td>
              ${score}
            </td>

            <td>
              ${status}
            </td>
          </tr>
        `;

      });

  } catch (error) {

    console.error(
      "FIXTURES ERROR:",
      error
    );

    fixturesTable.innerHTML = `
      <tr>
        <td colspan="5">
          Error loading fixtures
        </td>
      </tr>
    `;

  }

}


// ============================
// WEEK CHANGE
// ============================

weekSelect.addEventListener(
  "change",
  loadFixtures
);


// ============================
// START
// ============================

generateFixtures();

loadWeeks();
