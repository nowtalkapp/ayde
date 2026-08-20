const cars = [
 {id:"supra",brand:"Toyota",name:"GR Supra",year:2024,engine:"3.0L Turbo I6",power:"382 hp",torque:"368 lb-ft",drive:"RWD",zero:"3.9 sec",top:"155 mph",weight:"3,400 lb",price:"$54,595",image:"assets/cars/supra.svg",desc:"A compact rear-wheel-drive sports car with a turbocharged straight-six and a reputation for sharp, playful handling."},
 {id:"gtr",brand:"Nissan",name:"GT-R",year:2024,engine:"3.8L Twin-Turbo V6",power:"565 hp",torque:"467 lb-ft",drive:"AWD",zero:"2.9 sec",top:"196 mph",weight:"3,935 lb",price:"$121,090",image:"assets/cars/gtr.svg",desc:"Nissan's legendary twin-turbo all-wheel-drive performance flagship, blending immense pace with everyday usability."},
 {id:"m3",brand:"BMW",name:"M3 Competition",year:2024,engine:"3.0L Twin-Turbo I6",power:"503 hp",torque:"479 lb-ft",drive:"RWD",zero:"3.8 sec",top:"155 mph",weight:"3,840 lb",price:"$80,800",image:"assets/cars/m3.svg",desc:"A high-performance sedan that pairs a straight-six engine with serious chassis tuning and unmistakable M character."},
 {id:"911",brand:"Porsche",name:"911 Carrera",year:2024,engine:"3.0L Twin-Turbo Flat-6",power:"379 hp",torque:"331 lb-ft",drive:"RWD",zero:"4.0 sec",top:"182 mph",weight:"3,354 lb",price:"$116,050",image:"assets/cars/911.svg",desc:"The modern evolution of Porsche's enduring sports-car formula: rear-engine balance, precision, and everyday refinement."},
 {id:"mustang",brand:"Ford",name:"Mustang GT",year:2024,engine:"5.0L V8",power:"480 hp",torque:"415 lb-ft",drive:"RWD",zero:"4.2 sec",top:"155 mph",weight:"3,588 lb",price:"$44,055",image:"assets/cars/mustang.svg",desc:"A modern American performance coupe powered by a naturally aspirated V8 and wrapped in unmistakable Mustang design."},
 {id:"m4",brand:"BMW",name:"M4 Competition",year:2024,engine:"3.0L Twin-Turbo I6",power:"503 hp",torque:"479 lb-ft",drive:"RWD",zero:"3.8 sec",top:"155 mph",weight:"3,880 lb",price:"$81,100",image:"assets/cars/m4.svg",desc:"The coupe sibling to the M3, combining broad-shouldered styling with the same focused turbocharged performance."}
];

let selectedBrand = "All";
let compareIds = [];
let favorites = JSON.parse(localStorage.getItem("torqvault-favorites") || "[]");
let activeModalCar = null;

const grid = document.getElementById("carGrid");
const empty = document.getElementById("emptyState");
const carSearch = document.getElementById("carSearch");
const heroSearch = document.getElementById("heroSearch");
const favCount = document.getElementById("favCount");

function saveFavs(){localStorage.setItem("torqvault-favorites", JSON.stringify(favorites)); updateFavCount();}
function updateFavCount(){favCount.textContent=favorites.length;}
function isFav(id){return favorites.includes(id)}

function renderCars(){
  const q=(carSearch.value||heroSearch.value||"").trim().toLowerCase();
  const visible=cars.filter(c=>{
    const brandOk=selectedBrand==="All"||c.brand===selectedBrand;
    const text=[c.name,c.brand,c.year,c.engine].join(" ").toLowerCase();
    return brandOk && text.includes(q);
  });
  grid.innerHTML=visible.map(c=>`
    <article class="car-card" data-id="${c.id}">
      <div class="car-image"><img src="${c.image}" alt="${c.year} ${c.brand} ${c.name}"></div>
      <div class="car-info">
        <div class="car-meta"><span>${c.brand}</span><span>${c.year}</span></div>
        <div class="car-name">${c.name}</div>
        <div class="card-bottom">
          <span class="car-spec">${c.power} · ${c.zero} 0–60</span>
          <div>
            <button class="compare-btn" data-compare="${c.id}">${compareIds.includes(c.id)?"✓ Added":"Compare"}</button>
            <button class="heart ${isFav(c.id)?"saved":""}" data-fav="${c.id}" title="Save">♡</button>
          </div>
        </div>
      </div>
    </article>`).join("");
  empty.style.display=visible.length?"none":"block";
}
renderCars(); updateFavCount();

document.getElementById("filters").addEventListener("click",e=>{
  const btn=e.target.closest(".filter"); if(!btn)return;
  selectedBrand=btn.dataset.brand;
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===btn));
  renderCars();
});

document.querySelectorAll("[data-brand-jump]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selectedBrand=btn.dataset.brand;
    document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.brand===selectedBrand));
    document.getElementById("cars").scrollIntoView({behavior:"smooth"});
    renderCars();
  });
});

function syncSearch(source){
  if(source===heroSearch) carSearch.value=heroSearch.value;
  else heroSearch.value=carSearch.value;
  renderCars();
}
heroSearch.addEventListener("input",()=>syncSearch(heroSearch));
carSearch.addEventListener("input",()=>syncSearch(carSearch));

grid.addEventListener("click",e=>{
  const fav=e.target.closest("[data-fav]");
  if(fav){e.stopPropagation(); const id=fav.dataset.fav; favorites=isFav(id)?favorites.filter(x=>x!==id):[...favorites,id]; saveFavs(); renderCars(); return;}
  const cmp=e.target.closest("[data-compare]");
  if(cmp){e.stopPropagation(); toggleCompare(cmp.dataset.compare); return;}
  const card=e.target.closest(".car-card");
  if(card) openModal(card.dataset.id);
});

function toggleCompare(id){
  if(compareIds.includes(id)) compareIds=compareIds.filter(x=>x!==id);
  else if(compareIds.length<3) compareIds.push(id);
  else { alert("You can compare up to 3 cars."); return; }
  renderCars(); renderCompare();
}

function renderCompare(){
  const board=document.getElementById("compareBoard");
  if(!compareIds.length){
    board.innerHTML='<div class="compare-empty">Select cars using the <strong>Compare</strong> button on any card.</div>';
    return;
  }
  const chosen=compareIds.map(id=>cars.find(c=>c.id===id));
  const rows=[["Engine","engine"],["Power","power"],["Torque","torque"],["Drivetrain","drive"],["0–60 mph","zero"],["Top speed","top"],["Weight","weight"],["Starting price","price"]];
  board.innerHTML=`<table class="compare-table">
    <thead><tr><th></th>${chosen.map(c=>`<th><img src="${c.image}" alt=""><br>${c.brand} ${c.name}<br><button class="compare-btn" data-remove="${c.id}">Remove</button></th>`).join("")}</tr></thead>
    <tbody>${rows.map(([label,key])=>`<tr><td>${label}</td>${chosen.map(c=>`<td>${c[key]}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>`;
}
document.getElementById("compareBoard").addEventListener("click",e=>{
  const b=e.target.closest("[data-remove]"); if(b){toggleCompare(b.dataset.remove);}
});

const backdrop=document.getElementById("modalBackdrop");
function openModal(id){
  const c=cars.find(x=>x.id===id); activeModalCar=c;
  document.getElementById("modalImg").src=c.image;
  document.getElementById("modalImg").alt=`${c.year} ${c.brand} ${c.name}`;
  document.getElementById("modalBrand").textContent=`${c.brand} · ${c.year}`;
  document.getElementById("modalName").textContent=c.name;
  document.getElementById("modalDescription").textContent=c.desc;
  document.getElementById("modalSpecs").innerHTML=[
    ["Engine",c.engine],["Power",c.power],["Torque",c.torque],["Drive",c.drive],["0–60",c.zero],["Top speed",c.top],["Weight",c.weight],["MSRP",c.price]
  ].map(([k,v])=>`<div class="spec"><small>${k}</small><b>${v}</b></div>`).join("");
  document.getElementById("modalFav").textContent=isFav(c.id)?"♥ Saved":"♡ Save car";
  backdrop.classList.add("open");
}
function closeModal(){backdrop.classList.remove("open")}
document.getElementById("modalClose").onclick=closeModal;
backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal()});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeModal();
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();heroSearch.focus();}
});
document.getElementById("modalFav").onclick=()=>{
  const id=activeModalCar.id;
  favorites=isFav(id)?favorites.filter(x=>x!==id):[...favorites,id];
  saveFavs(); document.getElementById("modalFav").textContent=isFav(id)?"♥ Saved":"♡ Save car"; renderCars();
};
document.getElementById("modalCompare").onclick=()=>{toggleCompare(activeModalCar.id);closeModal();document.getElementById("compare").scrollIntoView({behavior:"smooth"})};

document.getElementById("favoritesBtn").onclick=()=>{
  if(!favorites.length){alert("You don't have any saved cars yet.");return;}
  selectedBrand="All"; carSearch.value=""; heroSearch.value="";
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.brand==="All"));
  grid.innerHTML=cars.filter(c=>favorites.includes(c.id)).map(c=>`
    <article class="car-card" data-id="${c.id}">
      <div class="car-image"><img src="${c.image}" alt="${c.year} ${c.brand} ${c.name}"></div>
      <div class="car-info"><div class="car-meta"><span>${c.brand}</span><span>${c.year}</span></div><div class="car-name">${c.name}</div>
      <div class="card-bottom"><span class="car-spec">${c.power} · ${c.zero} 0–60</span><button class="heart saved" data-fav="${c.id}">♥</button></div></div>
    </article>`).join("");
  document.getElementById("cars").scrollIntoView({behavior:"smooth"});
};

document.getElementById("menuBtn").onclick=()=>document.getElementById("mobileMenu").classList.add("open");
document.getElementById("mobileClose").onclick=()=>document.getElementById("mobileMenu").classList.remove("open");
document.querySelectorAll(".mobile-menu a").forEach(a=>a.onclick=()=>document.getElementById("mobileMenu").classList.remove("open"));
