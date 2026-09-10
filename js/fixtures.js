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

    for (let i = 0; i < 6; i++) {

      const team1 = list[i];
      const team2 = list[11 - i];

      let home;
      let away;


      // If possible, make both teams
      // alternate from last week's venue

      if (
        lastVenue[team1] === "H" &&
        lastVenue[team2] === "A"
      ) {

        home = team2;
        away = team1;

      } else if (
        lastVenue[team1] === "A" &&
        lastVenue[team2] === "H"
      ) {

        home = team1;
        away = team2;

      } else {

        // If perfect alternation is impossible,
        // give home to the team with fewer
        // home matches so far.

        if (
          homeCount[team1] <=
          homeCount[team2]
        ) {

          home = team1;
          away = team2;

        } else {

          home = team2;
          away = team1;

        }

      }


      fixtures.push({
        week: week,
        home: home,
        away: away
      });


      lastVenue[home] = "H";
      lastVenue[away] = "A";

      homeCount[home]++;

    }


    const last = list.pop();

    list.splice(1, 0, last);

  }


  // =========================
  // WEEKS 12 - 22
  // SAME FIXTURES, VENUES REVERSED
  // =========================

  const firstHalf = [...fixtures];

  firstHalf.forEach(fixture => {

    fixtures.push({
      week: fixture.week + 11,
      home: fixture.away,
      away: fixture.home
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
