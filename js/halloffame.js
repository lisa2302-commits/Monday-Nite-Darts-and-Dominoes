const SUPABASE_URL =
  "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";


async function loadHallOfFame() {

  const table =
    document.getElementById("hallTable");

  const mostTitles =
    document.getElementById("mostTitles");

  const most180s =
    document.getElementById("most180s");

  const highestCheckout =
    document.getElementById("highestCheckout");

  const mostDomino30 =
    document.getElementById("mostDomino30");


  try {

    const [
      championsResponse,
      playersResponse
    ] = await Promise.all([

      fetch(
        SUPABASE_URL +
        "/rest/v1/champions?select=id,season,team&order=id.desc",
        {
          headers: {
            "apikey": SUPABASE_KEY
          }
        }
      ),

      fetch(
        SUPABASE_URL +
        "/rest/v1/players?select=id,name,team,hundreds,checkout,domino30",
        {
          headers: {
            "apikey": SUPABASE_KEY
          }
        }
      )

    ]);


    if (
      !championsResponse.ok ||
      !playersResponse.ok
    ) {
      throw new Error(
        "Could not load Hall of Fame data."
      );
    }


    const champions =
      await championsResponse.json();

    const players =
      await playersResponse.json();


    // =========================
    // CHAMPIONS TABLE
    // =========================

    if (table) {

      table.innerHTML = "";

      if (!champions.length) {

        table.innerHTML = `
          <tr>
            <td colspan="2">
              No champions recorded yet
            </td>
          </tr>
        `;

      } else {

        champions.forEach(champion => {

          table.innerHTML += `
            <tr>
              <td>${champion.season}</td>
              <td>🏆 ${champion.team}</td>
            </tr>
          `;

        });

      }
    }


    // =========================
    // MOST LEAGUE TITLES
    // =========================

    if (mostTitles) {

      if (!champions.length) {

        mostTitles.textContent = "—";

      } else {

        const titleCounts = {};

        champions.forEach(champion => {

          titleCounts[champion.team] =
            (titleCounts[champion.team] || 0) + 1;

        });

        const highestTotal =
          Math.max(
            ...Object.values(titleCounts)
          );

        const tiedTeams =
          Object.entries(titleCounts)
            .filter(
              ([team, total]) =>
                total === highestTotal
            )
            .map(
              ([team]) => team
            );

        mostTitles.textContent =
          tiedTeams.join(" / ") +
          " (" +
          highestTotal +
          ")";
      }
    }


    // =========================
    // MOST 180s
    // =========================

    if (most180s) {

      if (!players.length) {

        most180s.textContent = "—";

      } else {

        const highest180 =
          Math.max(
            ...players.map(
              player =>
                Number(player.hundreds || 0)
            )
          );

        const tiedPlayers =
          players.filter(
            player =>
              Number(player.hundreds || 0) ===
              highest180
          );

        most180s.textContent =
          tiedPlayers
            .map(player => player.name)
            .join(" / ") +
          " (" +
          highest180 +
          ")";
      }
    }


    // =========================
    // HIGHEST CHECKOUT
    // =========================

    if (highestCheckout) {

      if (!players.length) {

        highestCheckout.textContent = "—";

      } else {

        const highestValue =
          Math.max(
            ...players.map(
              player =>
                Number(player.checkout || 0)
            )
          );

        const tiedPlayers =
          players.filter(
            player =>
              Number(player.checkout || 0) ===
              highestValue
          );

        highestCheckout.textContent =
          tiedPlayers
            .map(player => player.name)
            .join(" / ") +
          " (" +
          highestValue +
          ")";
      }
    }


    // =========================
    // MOST DOMINOES 3-0s
    // =========================

    if (mostDomino30) {

      if (!players.length) {

        mostDomino30.textContent = "—";

      } else {

        const highestDomino =
          Math.max(
            ...players.map(
              player =>
                Number(player.domino30 || 0)
            )
          );

        const tiedPlayers =
          players.filter(
            player =>
              Number(player.domino30 || 0) ===
              highestDomino
          );

        mostDomino30.textContent =
          tiedPlayers
            .map(player => player.name)
            .join(" / ") +
          " (" +
          highestDomino +
          ")";
      }
    }


  } catch (error) {

    console.error(
      "HALL OF FAME ERROR:",
      error
    );

    if (table) {
      table.innerHTML = `
        <tr>
          <td colspan="2">
            ❌ Unable to load Hall of Fame
          </td>
        </tr>
      `;
    }

  }
}


loadHallOfFame();
