const ADMIN_PASSWORD = "Monday123";
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

function saveAdminResult(){
  const week=Number(document.getElementById("weekSelect").value);
  const fixtureIndex=Number(document.getElementById("fixtureSelect").value);
  const match=fixtures.filter(f=>f.week===week)[fixtureIndex];
  const homeInput=document.getElementById("homeScore"), awayInput=document.getElementById("awayScore");
  if(!match){alert("Please select a fixture.");return;}
  if(homeInput.value===""||awayInput.value===""){alert("Please enter both scores.");return;}
  let results=JSON.parse(localStorage.getItem("results"))||[];
  if(results.some(r=>Number(r.week)===week&&r.home===match.home&&r.away===match.away)){alert("⚠️ This fixture already has a result!");return;}
  results.push({week,home:match.home,away:match.away,homeScore:Number(homeInput.value),awayScore:Number(awayInput.value)});
  localStorage.setItem("results",JSON.stringify(results));
  homeInput.value=""; awayInput.value=""; loadDeleteResults();
  alert("✅ Result saved!");
}

function loadDeleteResults(){
  const select=document.getElementById("deleteResultSelect"); if(!select)return;
  const results=JSON.parse(localStorage.getItem("results"))||[]; select.innerHTML="";
  if(!results.length){select.innerHTML='<option value="">No results yet</option>';return;}
  results.forEach((r,i)=>select.innerHTML+=`<option value="${i}">Week ${r.week}: ${r.home} ${r.homeScore}-${r.awayScore} ${r.away}</option>`);
}
function deleteAdminResult(){
  const select=document.getElementById("deleteResultSelect"); if(!select||select.value===""){alert("No result selected.");return;}
  let results=JSON.parse(localStorage.getItem("results"))||[]; const i=Number(select.value); if(!results[i])return;
  const r=results[i]; if(!confirm(`Delete Week ${r.week}: ${r.home} ${r.homeScore}-${r.awayScore} ${r.away}?`))return;
  results.splice(i,1); localStorage.setItem("results",JSON.stringify(results)); loadDeleteResults(); alert("🗑️ Result deleted.");
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
