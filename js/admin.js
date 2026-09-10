const SUPABASE_URL =
  "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";

let adminAccessToken = "";

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

let fixtures = [];
let onlineResults = [];
let onlinePlayers = [];


// ========================================
// ADMIN LOGIN
// ========================================

async function login() {

  const email =
    document.getElementById("adminEmail").value.trim();

  const password =
    document.getElementById("adminPassword").value;

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/auth/v1/token?grant_type=password",
      {
        method: "POST",

        headers: {
          "apikey": SUPABASE_KEY,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: email,
          password: password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      alert("❌ Incorrect email or password.");
      return;
    }

    adminAccessToken =
      data.access_token;

    document.getElementById(
      "loginCard"
    ).style.display = "none";

    document.getElementById(
      "adminPanel"
    ).style.display = "block";

    generateFixtures();
    loadWeeks();

    await loadAllPlayerSelectors();

    loadChampionTeams();

    await loadDeleteResults();

    alert("🔐 Admin logged in!");

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    alert("❌ Could not log in.");
  }
}


// ========================================
// FIXTURES
// ========================================

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

  const firstHalf =
    [...fixtures];

  firstHalf.forEach(f => {

    fixtures.push({
      week: f.week + 11,
      home: f.away,
      away: f.home
    });

  });
}


function loadWeeks() {

  const select =
    document.getElementById("weekSelect");

  if (!select) return;

  select.innerHTML = "";

  for (let w = 1; w <= 22; w++) {

    select.innerHTML += `
      <option value="${w}">
        Week ${w}
      </option>
    `;
  }

  loadFixturesForWeek();
}


function loadFixturesForWeek() {

  const weekSelect =
    document.getElementById("weekSelect");

  const fixtureSelect =
    document.getElementById("fixtureSelect");

  if (!weekSelect || !fixtureSelect) {
    return;
  }

  const week =
    Number(weekSelect.value);

  fixtureSelect.innerHTML = "";

  fixtures
    .filter(f => f.week === week)
    .forEach((f, i) => {

      fixtureSelect.innerHTML += `
        <option value="${i}">
          ${f.home} v ${f.away}
        </option>
      `;

    });
}


document.addEventListener(
  "change",
  e => {

    if (e.target.id === "weekSelect") {
      loadFixturesForWeek();
    }

  }
);


// ========================================
// SAVE RESULT
// ========================================

async function saveAdminResult() {

  const week =
    Number(
      document.getElementById(
        "weekSelect"
      ).value
    );

  const fixtureIndex =
    Number(
      document.getElementById(
        "fixtureSelect"
      ).value
    );

  const match =
    fixtures
      .filter(f => f.week === week)
      [fixtureIndex];

  const homeInput =
    document.getElementById(
      "homeScore"
    );

  const awayInput =
    document.getElementById(
      "awayScore"
    );

  if (!match) {

    alert(
      "Please select a fixture."
    );

    return;
  }

  if (
    homeInput.value === "" ||
    awayInput.value === ""
  ) {

    alert(
      "Please enter both scores."
    );

    return;
  }

  const homeScore =
    Number(homeInput.value);

  const awayScore =
    Number(awayInput.value);

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/results",
      {
        method: "POST",

        headers: {
          "apikey":
            SUPABASE_KEY,

          "Authorization":
            "Bearer " +
            adminAccessToken,

          "Content-Type":
            "application/json",

          "Prefer":
            "return=representation"
        },

        body: JSON.stringify({
          week: week,

          fixture:
            `${match.home} v ${match.away}`,

          home_score:
            homeScore,

          away_score:
            awayScore
        })
      }
    );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        errorText
      );

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    homeInput.value = "";
    awayInput.value = "";

    await loadDeleteResults();

    alert(
      "✅ Result saved online!"
    );

  } catch (error) {

    console.error(
      "SAVE RESULT ERROR:",
      error
    );

    alert(
      "❌ Result could not be saved."
    );
  }
}


// ========================================
// LOAD RESULTS FOR DELETE
// ========================================

async function loadDeleteResults() {

  const select =
    document.getElementById(
      "deleteResultSelect"
    );

  if (!select) return;

  select.innerHTML =
    '<option value="">Loading results...</option>';

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/results" +
      "?select=id,week,fixture,home_score,away_score" +
      "&order=week.asc",
      {
        headers: {
          "apikey":
            SUPABASE_KEY,

          "Authorization":
            "Bearer " +
            adminAccessToken
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    onlineResults =
      await response.json();

    select.innerHTML = "";

    if (!onlineResults.length) {

      select.innerHTML =
        '<option value="">No results yet</option>';

      return;
    }

    onlineResults.forEach(
      (r, i) => {

        const parts =
          r.fixture.split(
            /\s+v\s+/
          );

        const home =
          parts[0] || "";

        const away =
          parts[1] || "";

        select.innerHTML += `
          <option value="${i}">
            Week ${r.week}:
            ${home}
            ${r.home_score}-${r.away_score}
            ${away}
          </option>
        `;
      }
    );

  } catch (error) {

    console.error(
      "LOAD DELETE RESULTS ERROR:",
      error
    );

    select.innerHTML =
      '<option value="">Unable to load results</option>';
  }
}


// ========================================
// DELETE RESULT
// ========================================

async function deleteAdminResult() {

  const select =
    document.getElementById(
      "deleteResultSelect"
    );

  if (
    !select ||
    select.value === ""
  ) {

    alert(
      "No result selected."
    );

    return;
  }

  const result =
    onlineResults[
      Number(select.value)
    ];

  if (!result) return;

  const parts =
    result.fixture.split(
      /\s+v\s+/
    );

  const home =
    parts[0] || "";

  const away =
    parts[1] || "";

  if (
    !confirm(
      `Delete Week ${result.week}: ` +
      `${home} ${result.home_score}-` +
      `${result.away_score} ${away}?`
    )
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/results" +
        "?id=eq." +
        encodeURIComponent(
          result.id
        ),
        {
          method: "DELETE",

          headers: {
            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              adminAccessToken
          }
        }
      );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        errorText
      );

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    await loadDeleteResults();

    alert(
      "🗑️ Result deleted online."
    );

  } catch (error) {

    console.error(
      "DELETE RESULT ERROR:",
      error
    );

    alert(
      "❌ Result could not be deleted."
    );
  }
}


// ========================================
// PLAYER TEAM LIST
// ========================================

function loadPlayerTeam() {

  const select =
    document.getElementById(
      "playerTeam"
    );

  if (!select) return;

  select.innerHTML = "";

  teams.forEach(team => {

    select.innerHTML += `
      <option value="${team}">
        ${team}
      </option>
    `;

  });
}


// ========================================
// GET PLAYERS FROM SUPABASE
// ========================================

async function getPlayers() {

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/players" +
      "?select=id,name,team,hundreds,checkout,domino30" +
      "&order=name.asc",
      {
        headers: {
          "apikey":
            SUPABASE_KEY,

          "Authorization":
            "Bearer " +
            adminAccessToken
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    onlinePlayers =
      await response.json();

    return onlinePlayers;

  } catch (error) {

    console.error(
      "LOAD PLAYERS ERROR:",
      error
    );

    return [];
  }
}


// ========================================
// PLAYER DROPDOWNS
// ========================================

async function loadAllPlayerSelectors() {

  loadPlayerTeam();

  const players =
    await getPlayers();

  [
    "player180",
    "checkoutPlayer",
    "dominoPlayer",
    "deletePlayer"
  ].forEach(id => {

    const select =
      document.getElementById(id);

    if (!select) return;

    select.innerHTML = "";

    if (!players.length) {

      select.innerHTML =
        '<option value="">No players added yet</option>';

      return;
    }

    players.forEach(player => {

      select.innerHTML += `
        <option value="${player.id}">
          ${player.name} - ${player.team}
        </option>
      `;

    });

  });
}


// ========================================
// SAVE PLAYER
// ========================================

async function savePlayer() {

  const name =
    document.getElementById(
      "playerName"
    ).value.trim();

  const team =
    document.getElementById(
      "playerTeam"
    ).value;

  if (!name) {

    alert(
      "Please enter a player name."
    );

    return;
  }

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/players",
      {
        method: "POST",

        headers: {
          "apikey":
            SUPABASE_KEY,

          "Authorization":
            "Bearer " +
            adminAccessToken,

          "Content-Type":
            "application/json",

          "Prefer":
            "return=representation"
        },

        body: JSON.stringify({
          name: name,
          team: team,
          hundreds: 0,
          checkout: 0,
          domino30: 0
        })
      }
    );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        errorText
      );

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    document.getElementById(
      "playerName"
    ).value = "";

    await loadAllPlayerSelectors();

    alert(
      "👤 Player saved online!"
    );

  } catch (error) {

    console.error(
      "SAVE PLAYER ERROR:",
      error
    );

    alert(
      "❌ Player could not be saved."
    );
  }
}


// ========================================
// FIND PLAYER BY ID
// ========================================

function findOnlinePlayer(id) {

  return onlinePlayers.find(
    player =>
      String(player.id) ===
      String(id)
  );
}


// ========================================
// DELETE PLAYER
// ========================================

async function deletePlayer() {

  const select =
    document.getElementById(
      "deletePlayer"
    );

  if (
    !select ||
    select.value === ""
  ) {

    alert(
      "Please select a player."
    );

    return;
  }

  const player =
    findOnlinePlayer(
      select.value
    );

  if (!player) {

    alert(
      "Player could not be found."
    );

    return;
  }

  if (
    !confirm(
      `Delete ${player.name}? ` +
      "This removes their 180s, " +
      "checkout and 3–0 stats."
    )
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/players" +
        "?id=eq." +
        encodeURIComponent(
          player.id
        ),
        {
          method: "DELETE",

          headers: {
            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              adminAccessToken
          }
        }
      );

    if (!response.ok) {

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    await loadAllPlayerSelectors();

    alert(
      "🗑️ Player deleted online."
    );

  } catch (error) {

    console.error(
      "DELETE PLAYER ERROR:",
      error
    );

    alert(
      "❌ Player could not be deleted."
    );
  }
}


// ========================================
// ADD 180
// ========================================

async function add180() {

  const select =
    document.getElementById(
      "player180"
    );

  if (
    !select ||
    select.value === ""
  ) {

    alert(
      "Please select a player."
    );

    return;
  }

  const player =
    findOnlinePlayer(
      select.value
    );

  if (!player) {

    alert(
      "Player could not be found."
    );

    return;
  }

  const newTotal =
    (Number(player.hundreds) || 0) + 1;

  try {

    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/players" +
        "?id=eq." +
        encodeURIComponent(
          player.id
        ),
        {
          method: "PATCH",

          headers: {
            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              adminAccessToken,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            hundreds: newTotal
          })
        }
      );

    if (!response.ok) {

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    await loadAllPlayerSelectors();

    alert(
      `🎯 180 added for ${player.name}!`
    );

  } catch (error) {

    console.error(
      "ADD 180 ERROR:",
      error
    );

    alert(
      "❌ 180 could not be saved."
    );
  }
}


// ========================================
// ADD DOMINOES 3-0
// ========================================

async function addDomino30() {

  const select =
    document.getElementById(
      "dominoPlayer"
    );

  if (
    !select ||
    select.value === ""
  ) {

    alert(
      "Please select a player."
    );

    return;
  }

  const player =
    findOnlinePlayer(
      select.value
    );

  if (!player) {

    alert(
      "Player could not be found."
    );

    return;
  }

  const newTotal =
    (Number(player.domino30) || 0) + 1;

  try {

    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/players" +
        "?id=eq." +
        encodeURIComponent(
          player.id
        ),
        {
          method: "PATCH",

          headers: {
            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              adminAccessToken,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            domino30: newTotal
          })
        }
      );

    if (!response.ok) {

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    await loadAllPlayerSelectors();

    alert(
      `🎲 3–0 added for ${player.name}!`
    );

  } catch (error) {

    console.error(
      "ADD 3-0 ERROR:",
      error
    );

    alert(
      "❌ 3–0 could not be saved."
    );
  }
}


// ========================================
// HIGHEST CHECKOUT
// ========================================

async function saveCheckout() {

  const select =
    document.getElementById(
      "checkoutPlayer"
    );

  const input =
    document.getElementById(
      "checkoutValue"
    );

  if (
    !select ||
    select.value === ""
  ) {

    alert(
      "Please select a player."
    );

    return;
  }

  const value =
    Number(input.value);

  if (
    !value ||
    value < 1
  ) {

    alert(
      "Please enter a checkout."
    );

    return;
  }

  const player =
    findOnlinePlayer(
      select.value
    );

  if (!player) {

    alert(
      "Player could not be found."
    );

    return;
  }

  const current =
    Number(player.checkout) || 0;

  if (value <= current) {

    alert(
      `The player's existing highest checkout is already ${current}.`
    );

    return;
  }

  try {

    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/players" +
        "?id=eq." +
        encodeURIComponent(
          player.id
        ),
        {
          method: "PATCH",

          headers: {
            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " +
              adminAccessToken,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            checkout: value
          })
        }
      );

    if (!response.ok) {

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    input.value = "";

    await loadAllPlayerSelectors();

    alert(
      `🎯 Highest checkout saved for ${player.name}!`
    );

  } catch (error) {

    console.error(
      "SAVE CHECKOUT ERROR:",
      error
    );

    alert(
      "❌ Checkout could not be saved."
    );
  }
}


// ========================================
// CHAMPIONS
// ========================================

function loadChampionTeams() {

  const select =
    document.getElementById(
      "championTeam"
    );

  if (!select) return;

  select.innerHTML = "";

  teams.forEach(team => {

    select.innerHTML += `
      <option value="${team}">
        ${team}
      </option>
    `;

  });
}


async function saveChampion() {

  const season =
    document.getElementById(
      "championSeason"
    ).value.trim();

  const team =
    document.getElementById(
      "championTeam"
    ).value;

  if (!season) {

    alert(
      "Please enter the season."
    );

    return;
  }

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/champions",
      {
        method: "POST",

        headers: {
          "apikey":
            SUPABASE_KEY,

          "Authorization":
            "Bearer " +
            adminAccessToken,

          "Content-Type":
            "application/json",

          "Prefer":
            "return=representation"
        },

        body: JSON.stringify({
          season: season,
          team: team
        })
      }
    );

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        errorText
      );

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    document.getElementById(
      "championSeason"
    ).value = "";

    alert(
      `🏆 ${team} saved as champions for ${season}!`
    );

  } catch (error) {

    console.error(
      "SAVE CHAMPION ERROR:",
      error
    );

    alert(
      "❌ Champion could not be saved."
    );
  }
}


// ========================================
// BACKUP
// ========================================

async function backupLeague() {

  try {

    const headers = {
      "apikey": SUPABASE_KEY,
      "Authorization":
        "Bearer " + adminAccessToken
    };

    const resultsResponse =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/results?select=*",
        { headers }
      );

    const playersResponse =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/players?select=*",
        { headers }
      );

    const championsResponse =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/champions?select=*",
        { headers }
      );

    if (
      !resultsResponse.ok ||
      !playersResponse.ok ||
      !championsResponse.ok
    ) {
      throw new Error(
        "Could not load backup data."
      );
    }

    const results =
      await resultsResponse.json();

    const players =
      await playersResponse.json();

    const champions =
      await championsResponse.json();

    const data = {
      backupDate:
        new Date().toISOString(),

      results: results,
      players: players,
      champions: champions
    };

    const backupText =
      JSON.stringify(
        data,
        null,
        2
      );


    // SHOW BACKUP ON SCREEN

    const backupArea =
      document.getElementById(
        "backupArea"
      );

    const backupBox =
      document.getElementById(
        "backupText"
      );

    if (backupArea) {
      backupArea.style.display =
        "block";
    }

    if (backupBox) {
      backupBox.value =
        backupText;
    }


    // DOWNLOAD BACKUP FILE

    const blob =
      new Blob(
        [backupText],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;

    link.download =
      "Monday-Nite-League-Backup-" +
      today +
      ".json";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );

    alert(
      "💾 League backup downloaded!"
    );

  } catch (error) {

    console.error(
      "BACKUP ERROR:",
      error
    );

    alert(
      "❌ Backup could not be downloaded."
    );
  }
}
