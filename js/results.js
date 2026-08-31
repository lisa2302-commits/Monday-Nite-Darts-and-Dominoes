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

const weekSelect = document.getElementById("weekSelect");
const fixtureSelect = document.getElementById("fixtureSelect");

let fixtures = [];

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


// LOAD WEEKS

function loadWeeks() {

  weekSelect.innerHTML = "";

  for (let week = 1; week <= 22; week++) {

    weekSelect.innerHTML += `
      <option value="${week}">
        Week ${week}
      </option>
    `;

  }

  loadFixturesForWeek();
}


// LOAD FIXTURES

function loadFixturesForWeek() {

  const week = Number(weekSelect.value);

  fixtureSelect.innerHTML = "";

  fixtures
    .filter(fixture => fixture.week === week)
    .forEach((fixture, index) => {

      fixtureSelect.innerHTML += `
        <option value="${index}">
          ${fixture.home} v ${fixture.away}
        </option>
      `;

    });

}


// CHANGE WEEK

weekSelect.addEventListener(
  "change",
  loadFixturesForWeek
);


// LOAD SAVED RESULTS

let results =
  JSON.parse(localStorage.getItem("results")) || [];


// SAVE RESULT

function saveResult() {

  const week = Number(weekSelect.value);

  const matches =
    fixtures.filter(
      fixture => fixture.week === week
    );

  const match =
    matches[Number(fixtureSelect.value)];

  const homeInput =
    document.getElementById("homeScore");

  const awayInput =
    document.getElementById("awayScore");

  if (
    homeInput.value === "" ||
    awayInput.value === ""
  ) {

    alert("Please enter both scores");

    return;

  }

  const homeScore = Number(homeInput.value);
  const awayScore = Number(awayInput.value);


  // CHECK DUPLICATE

  const alreadyEntered = results.some(result =>
    Number(result.week) === week &&
    result.home === match.home &&
    result.away === match.away
  );

  if (alreadyEntered) {

    alert("⚠️ This fixture already has a result!");

    return;

  }


  results.push({

    week: week,
    home: match.home,
    away: match.away,
    homeScore: homeScore,
    awayScore: awayScore

  });


  localStorage.setItem(
    "results",
    JSON.stringify(results)
  );


  loadResults();

  homeInput.value = "";
  awayInput.value = "";

  alert("✅ Result saved!");

}


// DISPLAY RESULTS

function loadResults() {

  const table =
    document.getElementById("resultsTable");

  if (!table) return;

  table.innerHTML = "";

  if (results.length === 0) {

    table.innerHTML = `
      <tr>
        <td colspan="5">
          No results yet
        </td>
      </tr>
    `;

    return;
  }


  [...results].reverse().forEach((result, index) => {

    table.innerHTML += `
      <tr>

        <td>Week ${result.week}</td>

        <td>${result.home}</td>

        <td>
          ${result.homeScore} -
          ${result.awayScore}
        </td>

        <td>${result.away}</td>

        <td>
          <button
            onclick="deleteResult(${index})">
            ❌
          </button>
        </td>

      </tr>
    `;

  });

}


// DELETE RESULT

function deleteResult(index) {

  if (!confirm(
    "Are you sure you want to delete this result?"
  )) {

    return;

  }

  results.splice(index, 1);

  localStorage.setItem(
    "results",
    JSON.stringify(results)
  );

  loadResults();

}


// START

generateFixtures();
loadWeeks();
loadResults();