const SUPABASE_URL =
  "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";


// ========================================
// LOAD PLAYER STATS FROM SUPABASE
// ========================================

async function loadStats() {

  const statsTable =
    document.getElementById("statsTable");

  const leaderboard180 =
    document.getElementById("leaderboard180");

  const dominoTable =
    document.getElementById("dominoTable");

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/players" +
      "?select=id,name,team,hundreds,checkout,domino30",
      {
        headers: {
          "apikey": SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        "Supabase returned " +
        response.status
      );
    }

    const players =
      await response.json();


    // =========================
    // ALL PLAYER STATS
    // =========================

    if (statsTable) {

      statsTable.innerHTML = "";

      const sortedPlayers =
        [...players].sort(
          (a, b) =>
            (Number(b.hundreds) || 0) -
            (Number(a.hundreds) || 0) ||
            (Number(b.checkout) || 0) -
            (Number(a.checkout) || 0)
        );

      if (!sortedPlayers.length) {

        statsTable.innerHTML = `
          <tr>
            <td colspan="4">
              No player stats yet
            </td>
          </tr>
        `;

      } else {

        sortedPlayers.forEach(player => {

          statsTable.innerHTML += `
            <tr>
              <td>${player.name}</td>
              <td>${player.team}</td>
              <td>${player.hundreds || 0}</td>
              <td>${player.checkout || 0}</td>
            </tr>
          `;

        });
      }
    }


    // =========================
    // MOST 180s
    // =========================

    if (leaderboard180) {

      leaderboard180.innerHTML = "";

      const sorted180s =
        [...players]
          .filter(
            player =>
              (Number(player.hundreds) || 0) > 0
          )
          .sort(
            (a, b) =>
              (Number(b.hundreds) || 0) -
              (Number(a.hundreds) || 0)
          );

      if (!sorted180s.length) {

        leaderboard180.innerHTML = `
          <tr>
            <td colspan="4">
              No 180s recorded yet
            </td>
          </tr>
        `;

      } else {

        sorted180s.forEach(
          (player, index) => {

            leaderboard180.innerHTML += `
              <tr>
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.team}</td>
                <td>${player.hundreds || 0}</td>
              </tr>
            `;

          }
        );
      }
    }


    // =========================
    // DOMINOES 3-0
    // =========================

    if (dominoTable) {

      dominoTable.innerHTML = "";

      const sortedDominoes =
        [...players]
          .filter(
            player =>
              (Number(player.domino30) || 0) > 0
          )
          .sort(
            (a, b) =>
              (Number(b.domino30) || 0) -
              (Number(a.domino30) || 0)
          );

      if (!sortedDominoes.length) {

        dominoTable.innerHTML = `
          <tr>
            <td colspan="4">
              No 3–0 wins recorded yet
            </td>
          </tr>
        `;

      } else {

        sortedDominoes.forEach(
          (player, index) => {

            dominoTable.innerHTML += `
              <tr>
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.team}</td>
                <td>${player.domino30 || 0}</td>
              </tr>
            `;

          }
        );
      }
    }


  } catch (error) {

    console.error(
      "STATS ERROR:",
      error
    );

    if (statsTable) {

      statsTable.innerHTML = `
        <tr>
          <td colspan="4">
            ❌ Unable to load player stats
          </td>
        </tr>
      `;
    }
  }
}


loadStats();
