// ============================
// LOAD CHAMPIONS
// ============================

function loadChampions() {

  const table =
    document.getElementById("hallTable");

  if (!table) return;

  const champions =
    JSON.parse(
      localStorage.getItem("champions")
    ) || [];

  table.innerHTML = "";

  if (champions.length === 0) {

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

}


// ============================
// LOAD PLAYER RECORDS
// ============================

function loadRecords() {

  const players =
    JSON.parse(
      localStorage.getItem("players")
    ) || [];

  if (players.length === 0) return;

  const most180s =
    [...players].sort(
      (a, b) =>
        (b.hundreds || 0) -
        (a.hundreds || 0)
    )[0];

  const highestCheckout =
    [...players].sort(
      (a, b) =>
        (b.checkout || 0) -
        (a.checkout || 0)
    )[0];

  const mostDominoes =
    [...players].sort(
      (a, b) =>
        (b.domino30 || 0) -
        (a.domino30 || 0)
    )[0];

  const records =
    document.querySelectorAll(
      ".card:nth-of-type(2) p strong"
    );

  if (records.length >= 4) {

    records[1].textContent =
      most180s.name +
      " (" +
      (most180s.hundreds || 0) +
      ")";

    records[2].textContent =
      highestCheckout.name +
      " (" +
      (highestCheckout.checkout || 0) +
      ")";

    records[3].textContent =
      mostDominoes.name +
      " (" +
      (mostDominoes.domino30 || 0) +
      ")";

  }

}


// ============================
// START
// ============================

loadChampions();
loadRecords();