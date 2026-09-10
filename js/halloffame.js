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

          if (!titleCounts[champion.team]) {
            titleCounts[champion.team] = 0;
          }

          titleCounts[champion.team]++;

        });


        let topTeam = "";
        let topTitles = 0;

        Object.entries(titleCounts)
          .forEach(([team, total]) => {

            if (total > topTitles) {

              topTeam = team;
              topTitles = total;

            }

          });


        mostTitles.textContent =
          topTeam +
          " (" +
          topTitles +
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

        const top180 =
          [...players].sort(
            (a, b) =>
              Number(b.hundreds || 0) -
              Number(a.hundreds || 0)
          )[0];

        most180s.textContent =
          top180.name +
          " (" +
          Number(top180.hundreds || 0) +
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

        const topCheckout =
          [...players].sort(
            (a, b) =>
              Number(b.checkout || 0) -
              Number(a.checkout || 0)
          )[0];

        highestCheckout.textContent =
          topCheckout.name +
          " (" +
          Number(topCheckout.checkout || 0) +
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

        const topDomino =
          [...players].sort(
            (a, b) =>
              Number(b.domino30 || 0) -
              Number(a.domino30 || 0)
          )[0];

        mostDomino30.textContent =
          topDomino.name +
          " (" +
          Number(topDomino.domino30 || 0) +
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
