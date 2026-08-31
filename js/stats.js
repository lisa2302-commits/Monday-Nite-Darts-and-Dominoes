const teams=["Crown A","Punch","ICI","Golden Cup","The Park Inn","Bird in Hand","Victoria A","Two Gates Club","Funky Room","Entwistle","Crown B","Victoria B"];
let players=JSON.parse(localStorage.getItem("players"))||[];
function loadPlayers(){
 const table=document.getElementById("statsTable"); if(!table)return; table.innerHTML="";
 const sorted=[...players].sort((a,b)=>(b.hundreds||0)-(a.hundreds||0)||(b.checkout||0)-(a.checkout||0));
 sorted.forEach(p=>table.innerHTML+=`<tr><td>${p.name}</td><td>${p.team}</td><td>${p.hundreds||0}</td><td>${p.checkout||0}</td></tr>`);
 const lb=document.getElementById("leaderboard180"); if(lb){lb.innerHTML="";sorted.filter(p=>(p.hundreds||0)>0).forEach((p,i)=>lb.innerHTML+=`<tr><td>${i+1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.hundreds||0}</td></tr>`);}
}
function loadDominoes(){
 const table=document.getElementById("dominoTable"); if(!table)return; table.innerHTML="";
 [...players].sort((a,b)=>(b.domino30||0)-(a.domino30||0)).filter(p=>(p.domino30||0)>0).forEach((p,i)=>table.innerHTML+=`<tr><td>${i+1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.domino30||0}</td></tr>`);
}
loadPlayers();loadDominoes();
