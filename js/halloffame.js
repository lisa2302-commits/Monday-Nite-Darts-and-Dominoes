const SUPABASE_URL =
  "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";


async function loadHallOfFame() {

  const table =
    document.getElementById("hallTable");

  if (!table) return;

  table.innerHTML = `
    <tr>
      <td colspan="2">
        Loading champions...
      </td>
    </tr>
  `;

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/champions?select=id,season,team&order=id.desc",
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

    const champions =
      await response.json();

    table.innerHTML = "";

    if (!champions.length) {

      table.innerHTML = `
        <tr>
          <td colspan="2">
            No champions recorded yet
          </td>
        </tr>
      `;

      return;
    }

    champions.forEach(champion => {

      table.innerHTML += `
        <tr>
          <td>${champion.season}</td>
          <td>🏆 ${champion.team}</td>
        </tr>
      `;

    });

  } catch (error) {

    console.error(
      "HALL OF FAME ERROR:",
      error
    );

    table.innerHTML = `
      <tr>
        <td colspan="2">
          ❌ Unable to load champions
        </td>
      </tr>
    `;
  }
}


loadHallOfFame();
