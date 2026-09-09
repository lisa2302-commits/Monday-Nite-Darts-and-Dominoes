const ADMIN_PASSWORD = "Monday123";
const SUPABASE_URL = "https://wevedaffdzdvbkxydblw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_NJ5-zUej-yNedbcp4dMPrQ_IYRH4p6t";
const teams = ["Crown A","Punch","ICI","Golden Cup","The Park Inn","Bird in Hand","Victoria A","Two Gates Club","Funky Room","Entwistle","Crown B","Victoria B"];
let fixtures=[];

function login(){
  const password=document.getElementById("adminPassword").value;
  if(password!==ADMIN_PASSWORD){alert("Incorrect password");return;}
  document.getElementById("loginCard").style.display="none";
  document.getElementById("adminPanel").style.display="block";
  generateFixtures(); loadWeeks(); loadAllPlayerSelectors(); loadChampionTeams(); loadDeleteResults();
}

function generateFixtures(){
  fixtures=[]; const list=[...teams];
  for(let week=1;week<=11;week++){
    for(let i=0;i<6;i++) fixtures.push({week,home:list[i],away:list[11-i]});
    const last=list.pop(); list.splice(1,0,last);
  }
  [...fixtures].forEach(f=>fixtures.push({week:f.week+11,home:f.away,away:f.home}));
}

function loadWeeks(){
  const select=document.getElementById("weekSelect"); if(!select)return;
  select.innerHTML="";
  for(let w=1;w<=22;w++) select.innerHTML+=`<option value="${w}">Week ${w}</option>`;
  loadFixturesForWeek();
}
function loadFixturesForWeek(){
  const ws=document.getElementById("weekSelect"), fs=document.getElementById("fixtureSelect"); if(!ws||!fs)return;
  const week=Number(ws.value); fs.innerHTML="";
  fixtures.filter(f=>f.week===week).forEach((f,i)=>fs.innerHTML+=`<option value="${i}">${f.home} v ${f.away}</option>`);
}
document.addEventListener("change",e=>{if(e.target.id==="weekSelect")loadFixturesForWeek();});

async function saveAdminResult() {

  const week =
    Number(document.getElementById("weekSelect").value);

  const fixtureIndex =
    Number(document.getElementById("fixtureSelect").value);

  const match =
    fixtures.filter(f => f.week === week)[fixtureIndex];

  const homeInput =
    document.getElementById("homeScore");

  const awayInput =
    document.getElementById("awayScore");

  if (!match) {
    alert("Please select a fixture.");
    return;
  }

  if (
    homeInput.value === "" ||
    awayInput.value === ""
  ) {
    alert("Please enter both scores.");
    return;
  }

  const homeScore = Number(homeInput.value);
  const awayScore = Number(awayInput.value);

  try {

    const response = await fetch(
      SUPABASE_URL + "/rest/v1/results",
      {
        method: "POST",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },

        body: JSON.stringify({
          week: week,
          fixture: `${match.home} v ${match.away}`,
          home_score: homeScore,
          away_score: awayScore
        })
      }
    );

    if (!response.ok) {

      const errorText = await response.text();

      console.error(errorText);

      throw new Error(
        "Supabase returned " + response.status
      );
    }

    homeInput.value = "";
    awayInput.value = "";

    alert("✅ Result saved online!");

  } catch (error) {

    console.error("SAVE RESULT ERROR:", error);

    alert(
      "❌ Result could not be saved. Check the console."
    );
  }
}

let onlineResults = [];

async function loadDeleteResults() {

  const select =
    document.getElementById("deleteResultSelect");

  if (!select) return;

  select.innerHTML =
    '<option value="">Loading results...</option>';

  try {

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/results?select=week,fixture,home_score,away_score&order=week.asc",
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization":
            "Bearer " + SUPABASE_KEY
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

    onlineResults.forEach((r, i) => {

      const teams =
        r.fixture.split(/\s+v\s+/);

      const home =
        teams[0] || "";

      const away =
        teams[1] || "";

      select.innerHTML += `
        <option value="${i}">
          Week ${r.week}: ${home}
          ${r.home_score}-${r.away_score}
          ${away}
        </option>
      `;

    });

  } catch (error) {

    console.error(
      "LOAD DELETE RESULTS ERROR:",
      error
    );

    select.innerHTML =
      '<option value="">Unable to load results</option>';
  }
}


async function deleteAdminResult() {

  const select =
    document.getElementById("deleteResultSelect");

  if (
    !select ||
    select.value === ""
  ) {

    alert("No result selected.");
    return;
  }

  const r =
    onlineResults[Number(select.value)];

  if (!r) return;


  const teams =
    r.fixture.split(/\s+v\s+/);

  const home =
    teams[0] || "";

  const away =
    teams[1] || "";


  if (
    !confirm(
      `Delete Week ${r.week}: ` +
      `${home} ${r.home_score}-${r.away_score} ${away}?`
    )
  ) {
    return;
  }


  try {

    const params =
      new URLSearchParams();

    params.set(
      "week",
      "eq." + r.week
    );

    params.set(
      "fixture",
      "eq." + r.fixture
    );


    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/results?" +
        params.toString(),
        {
          method: "DELETE",

          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization":
              "Bearer " + SUPABASE_KEY
          }
        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(errorText);

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

function loadPlayerTeam(){const s=document.getElementById("playerTeam");if(!s)return;s.innerHTML="";teams.forEach(t=>s.innerHTML+=`<option value="${t}">${t}</option>`);}
function getPlayers(){return JSON.parse(localStorage.getItem("players"))||[];}
function setPlayers(players){localStorage.setItem("players",JSON.stringify(players));}
function loadAllPlayerSelectors(){
  loadPlayerTeam(); const players=getPlayers();
  ["player180","checkoutPlayer","dominoPlayer","deletePlayer"].forEach(id=>{
    const s=document.getElementById(id); if(!s)return; s.innerHTML="";
    if(!players.length){s.innerHTML='<option value="">No players added yet</option>';return;}
    players.forEach((pl,i)=>s.innerHTML+=`<option value="${i}">${pl.name} - ${pl.team}</option>`);
  });
}
function savePlayer(){
  const name=document.getElementById("playerName").value.trim(); const team=document.getElementById("playerTeam").value;
  if(!name){alert("Please enter a player name.");return;}
  const players=getPlayers(); players.push({name,team,hundreds:0,checkout:0,domino30:0}); setPlayers(players);
  document.getElementById("playerName").value=""; loadAllPlayerSelectors(); alert("👤 Player saved!");
}
function deletePlayer(){
  const s=document.getElementById("deletePlayer"); if(!s||s.value===""){alert("Please select a player.");return;}
  const players=getPlayers(), i=Number(s.value); if(!players[i])return;
  if(!confirm(`Delete ${players[i].name}? This removes their 180s, checkout and 3–0 stats.`))return;
  players.splice(i,1); setPlayers(players); loadAllPlayerSelectors(); alert("🗑️ Player deleted.");
}
function add180(){
  const s=document.getElementById("player180"); if(!s||s.value===""){alert("Please select a player.");return;}
  const players=getPlayers(),i=Number(s.value); if(!players[i])return; players[i].hundreds=(Number(players[i].hundreds)||0)+1; setPlayers(players); alert(`🎯 180 added for ${players[i].name}!`);
}
function addDomino30(){
  const s=document.getElementById("dominoPlayer"); if(!s||s.value===""){alert("Please select a player.");return;}
  const players=getPlayers(),i=Number(s.value); if(!players[i])return; players[i].domino30=(Number(players[i].domino30)||0)+1; setPlayers(players); alert(`🎲 3–0 added for ${players[i].name}!`);
}
function saveCheckout(){
  const s=document.getElementById("checkoutPlayer"), input=document.getElementById("checkoutValue"); if(!s||s.value===""){alert("Please select a player.");return;}
  const value=Number(input.value),players=getPlayers(),i=Number(s.value); if(!players[i])return;
  if(!value||value<1){alert("Please enter a checkout.");return;}
  const current=Number(players[i].checkout)||0; if(value<=current){alert(`The player's existing highest checkout is already ${current}.`);return;}
  players[i].checkout=value; setPlayers(players); input.value=""; alert(`🎯 Highest checkout saved for ${players[i].name}!`);
}
function loadChampionTeams(){const s=document.getElementById("championTeam");if(!s)return;s.innerHTML="";teams.forEach(t=>s.innerHTML+=`<option value="${t}">${t}</option>`);}
function saveChampion(){
  const season=document.getElementById("championSeason").value.trim(),team=document.getElementById("championTeam").value; if(!season){alert("Please enter the season.");return;}
  const champions=JSON.parse(localStorage.getItem("champions"))||[];champions.push({season,team});localStorage.setItem("champions",JSON.stringify(champions));document.getElementById("championSeason").value="";alert(`🏆 ${team} saved as champions for ${season}!`);
}
function backupLeague(){
  const data={results:JSON.parse(localStorage.getItem("results")||"[]"),players:JSON.parse(localStorage.getItem("players")||"[]"),champions:JSON.parse(localStorage.getItem("champions")||"[]")};
  document.getElementById("backupArea").style.display="block";document.getElementById("backupText").value=JSON.stringify(data,null,2);
}
