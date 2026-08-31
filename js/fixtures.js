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

  for (let week = 1; week <= 11; week++) {

    for (let i = 0; i < 6; i++) {

      fixtures.push({
        week: week,
        home: list[i],
        away: list[11 - i]
      });

    }

    const last = list.pop();

    list.splice(1, 0, last);
  }


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
// LOAD FIXTURES
// ============================

function loadFixtures() {

  const selectedWeek =
    Number(weekSelect.value);

  fixturesTable.innerHTML = "";


  // Get saved results
  const results =
    JSON.parse(
      localStorage.getItem("results")
    ) || [];


  fixtures
    .filter(
      fixture => fixture.week === selectedWeek
    )
    .forEach(fixture => {


      // Look for this fixture in saved results
      const result = results.find(saved =>

        Number(saved.week) === fixture.week &&

        (
          (
            saved.home === fixture.home &&
            saved.away === fixture.away
          )

          ||

          (
            saved.home === fixture.away &&
            saved.away === fixture.home
          )
        )

      );


      let status = "⚪ Not Played";

      let score = "-";


      if (result) {

        status = "🟢 Played";

        score =
          `${result.homeScore} - ${result.awayScore}`;

      }


      fixturesTable.innerHTML += `

        <tr>

          <td>Week ${fixture.week}</td>

          <td>${fixture.home}</td>

          <td>${fixture.away}</td>

          <td>${score}</td>

          <td>${status}</td>

        </tr>

      `;

    });

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