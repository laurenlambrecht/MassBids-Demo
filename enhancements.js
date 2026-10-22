(() => {
"use strict";
const sample = [
["Boston","Municipal fleet EV charging infrastructure","Infrastructure","2026-11-18","$2.4M–$3.1M","Public Works","Design-build charging stations across municipal depots.","bos-1"],
["Boston","Enterprise financial management system","Technology","2026-12-02","$890K–$1.2M","Office of Budget","Cloud ERP for procurement, grants, and financial reporting.","bos-2"],
["Boston","Harbor district security & access control","Services","2026-11-28","$410K–$520K","Homeland Security","Access-control upgrades for waterfront facilities.","bos-3"],
["Boston","Streetscape ADA ramp program — Phase IV","Infrastructure","2027-01-12","$5.5M–$6.8M","Transportation","Citywide accessibility and intersection upgrades.","bos-4"],
["Worcester","School nutrition warehouse cold storage","Infrastructure","2026-11-25","$1.1M–$1.4M","Public Schools","Warehouse refrigeration and inventory upgrades.","wor-1"],
["Worcester","311 / CRM platform migration","Technology","2026-12-22","$620K–$780K","Digital Services","City service request and resident support platform.","wor-2"],
["Worcester","Uniforms & PPE consolidated supply","Services","2026-11-30","$180K–$240K","Central Procurement","Multi-year public sector uniform supply contract.","wor-3"],
["Springfield","Wastewater pump station SCADA upgrade","Infrastructure","2027-01-21","$3.2M–$3.9M","Water & Sewer","Modernized monitoring and controls for pump stations.","spr-1"],
["Springfield","Cybersecurity managed detection & response","Technology","2026-12-14","$340K–$420K","IT","Managed security monitoring and response services.","spr-2"],
["Springfield","Parks turf maintenance equipment","Services","2026-11-20","$95K–$125K","Parks & Recreation","Commercial equipment acquisition and training.","spr-3"],
["Cambridge","Net-zero library mechanical retrofit","Infrastructure","2027-01-04","$4.0M–$4.6M","Public Facilities","Library heat-pump retrofit and commissioning.","cam-1"],
["Cambridge","Open data & API gateway","Technology","2026-12-09","$510K–$650K","Innovation & Technology","Public data infrastructure and developer APIs.","cam-2"],
["Lowell","Canal walk lighting & handrail replacement","Infrastructure","2026-11-27","$780K–$920K","Planning & Development","Historic district pedestrian infrastructure upgrade.","low-1"],
["Lowell","Records digitization & archival hosting","Technology","2027-01-19","$275K–$330K","City Clerk","Digitization and secure archives modernization.","low-2"],
["Lowell","Janitorial services — municipal buildings","Services","2026-11-15","$1.5M–$1.9M","Facilities","Cleaning and maintenance across public facilities.","low-3"],
["Quincy","Coastal resilience study & pilot berms","Infrastructure","2027-02-03","$1.6M–$2.0M","Harbor & Coastal","Engineering assessment and coastal protection pilot.","qui-1"],
["Quincy","Payroll & timekeeping modernization","Technology","2026-12-30","$720K–$880K","Human Resources","Modern workforce management platform.","qui-2"],
["Newton","Traffic signal cabinet replacements","Infrastructure","2026-12-16","$2.1M–$2.5M","Traffic Engineering","Signal controller replacement at 12 intersections.","new-1"],
["Newton","Office supplies & managed print","Services","2026-11-25","$210K–$280K","Purchasing","Consolidated managed-print and supplies.","new-2"],
["Somerville","Green line corridor utility coordination","Infrastructure","2027-02-15","$6.2M–$7.5M","Infrastructure","Utility coordination and protection during transit works.","som-1"],
["Somerville","Grants management software","Technology","2027-01-01","$380K–$460K","Finance","Grants lifecycle and reporting platform.","som-2"],
["Somerville","Food waste collection carts & hauling","Services","2026-12-08","$140K–$190K","Sustainability","Organics collection for municipal pilot districts.","som-3"]
].map(([city,title,category,deadline,value,department,description,id])=>({city,title,category,deadline,value,department,description,id}));
const categories={A:"Infrastructure",B:"Technology",C:"Services"};
let activeCategory="all", query="", savedOnly=false, sort="deadline";
const key="massbids-demo-saved-v1";
let saved=new Set();
try {saved=new Set(JSON.parse(localStorage.getItem(key)||"[]"));} catch {}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const save=()=>{try{localStorage.setItem(key,JSON.stringify([...saved]));}catch{}};
const main=document.querySelector(".main"), toolbar=document.querySelector(".toolbar");
const dashboard=document.querySelector(".dashboard");
const header=document.createElement("section");
header.className="product-intro";
header.innerHTML='<div><div class="eyebrow">MASSACHUSETTS PROCUREMENT INTELLIGENCE <span class="demo-pill">Interactive concept · sample data</span></div><h1>Find your next public-sector opportunity.</h1><p>One searchable home for local government contracts. Explore municipalities, compare opportunities, and build your shortlist.</p></div><div class="intro-side"><div class="intro-mark">✦</div><span>Discover smarter.<br><strong>Bid with confidence.</strong></span></div>';
main.insertBefore(header,toolbar);
const stats=document.createElement("section");
stats.className="overview-stats";
stats.setAttribute("aria-label","Demo overview");
stats.innerHTML='<div class="stat"><span>Sample opportunities</span><strong>'+sample.length+'</strong><small>Across participating demo cities</small></div><div class="stat"><span>Municipalities</span><strong>8</strong><small>Explore on the interactive map</small></div><div class="stat"><span>Categories</span><strong>3</strong><small>Infrastructure · Tech · Services</small></div><div class="stat"><span>Your shortlist</span><strong id="saved-total">0</strong><small>Saved locally in this browser</small></div>';
main.insertBefore(stats,toolbar);
document.querySelectorAll("[data-category]").forEach(el=>{const c=el.dataset.category;if(categories[c])el.textContent=categories[c];});
const tabs=document.createElement("div");tabs.className="product-tabs";tabs.innerHTML='<button type="button" class="product-tab is-active" data-view="all">All opportunities</button><button type="button" class="product-tab" data-view="saved">★ Saved bids <span id="saved-tab-count">0</span></button><span class="tab-note">Browse sample opportunities across Massachusetts</span>';
toolbar.after(tabs);
const controls=document.createElement("div");controls.className="feed-toolbar";controls.innerHTML='<div><h2>Opportunity directory</h2><p id="feed-count" aria-live="polite"></p></div><label>Sort by <select id="sort-bids"><option value="deadline">Closing date</option><option value="city">Municipality</option><option value="title">Opportunity title</option></select></label>';
const feed=document.createElement("div");feed.className="opportunity-feed";feed.id="opportunity-feed";
dashboard.after(controls,feed);
const footer=document.createElement("p");footer.className="demo-disclaimer";footer.textContent="Portfolio concept only. All listings, values, dates, and descriptions are illustrative—not live solicitations. No real bids can be submitted here.";feed.after(footer);
const modal=document.createElement("dialog");modal.className="bid-modal";modal.setAttribute("aria-label","Opportunity details");document.body.appendChild(modal);
const lookup=Object.fromEntries(sample.map(b=>[b.id,b]));
function render(){
document.getElementById("saved-total").textContent=saved.size;
document.getElementById("saved-tab-count").textContent=saved.size;
let results=sample.filter(b=>(activeCategory==="all"||b.category===categories[activeCategory])&&(!savedOnly||saved.has(b.id))&&[b.title,b.city,b.department,b.description,b.category].some(x=>x.toLowerCase().includes(query)));
results.sort((a,b)=>sort==="deadline"?a.deadline.localeCompare(b.deadline):a[sort].localeCompare(b[sort]));
document.getElementById("feed-count").textContent=results.length+" of "+sample.length+" sample opportunities";
feed.innerHTML=results.length?results.map(b=>'<article class="opportunity-card"><div class="opp-top"><span class="opp-category">'+esc(b.category)+'</span><button type="button" class="save-btn '+(saved.has(b.id)?"is-saved":"")+'" data-save="'+esc(b.id)+'" aria-label="'+(saved.has(b.id)?"Remove saved bid":"Save bid")+'" aria-pressed="'+saved.has(b.id)+'">'+(saved.has(b.id)?"★ Saved":"☆ Save")+'</button></div><h3>'+esc(b.title)+'</h3><p class="opp-city">⌖ '+esc(b.city)+' · '+esc(b.department)+'</p><p class="opp-description">'+esc(b.description)+'</p><div class="opp-bottom"><span><small>Estimated value</small><strong>'+esc(b.value)+'</strong></span><span><small>Closes</small><strong>'+date(b.deadline)+'</strong></span><button type="button" class="opp-detail" data-detail="'+esc(b.id)+'">Explore bid →</button></div></article>').join(""):'<div class="feed-empty"><strong>No matching opportunities</strong><p>Try a different keyword or category, or save a bid to build your shortlist.</p><button type="button" class="reset-filters">Clear filters</button></div>';
}
function detail(id){
const b=lookup[id];if(!b)return;
modal.innerHTML='<div class="modal-head"><span class="demo-pill">Illustrative opportunity</span><button type="button" class="modal-close" aria-label="Close details">✕</button></div><span class="opp-category">'+esc(b.category)+'</span><h2>'+esc(b.title)+'</h2><p class="opp-city">⌖ '+esc(b.city)+' · '+esc(b.department)+'</p><div class="modal-metrics"><div><small>Estimated contract value</small><strong>'+esc(b.value)+'</strong></div><div><small>Illustrative deadline</small><strong>'+date(b.deadline)+'</strong></div></div><h3>Project overview</h3><p>'+esc(b.description)+'</p><h3>What MassBids would provide</h3><p>In a connected product, this page would consolidate the original solicitation, eligibility requirements, supporting documents, amendments, and submission instructions from the issuing municipality.</p><div class="modal-actions"><button type="button" class="btn btn--primary modal-save" data-save="'+esc(b.id)+'">'+(saved.has(b.id)?"★ Saved to shortlist":"☆ Save to shortlist")+'</button><button type="button" class="btn btn--ghost modal-close">Close</button></div><p class="modal-footnote">Demonstration only. This is not an official bid or application portal.</p>';
modal.showModal();
}
document.addEventListener("click",e=>{
const btn=e.target.closest("button");if(!btn)return;
if(btn.matches(".btn-view")){e.preventDefault();e.stopImmediatePropagation();detail(btn.dataset.bidId);return;}
if(btn.dataset.save){saved.has(btn.dataset.save)?saved.delete(btn.dataset.save):saved.add(btn.dataset.save);save();render();if(modal.open)detailRefresh(btn.dataset.save);return;}
if(btn.dataset.detail){detail(btn.dataset.detail);return;}
if(btn.classList.contains("modal-close")){modal.close();return;}
if(btn.dataset.view){savedOnly=btn.dataset.view==="saved";document.querySelectorAll(".product-tab").forEach(t=>t.classList.toggle("is-active",t===btn));render();feed.scrollIntoView({behavior:"smooth",block:"start"});return;}
if(btn.classList.contains("reset-filters")){query="";activeCategory="all";savedOnly=false;document.getElementById("search-input").value="";document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("chip--active",c.dataset.category==="all"));document.querySelectorAll(".product-tab").forEach(t=>t.classList.toggle("is-active",t.dataset.view==="all"));render();return;}
},true);
function detailRefresh(id){const b=lookup[id];if(!b)return;const btn=modal.querySelector(".modal-save");if(btn)btn.textContent=saved.has(id)?"★ Saved to shortlist":"☆ Save to shortlist";}
document.getElementById("search-input").addEventListener("input",e=>{query=e.target.value.trim().toLowerCase();render();});
document.querySelectorAll(".chip").forEach(el=>el.addEventListener("click",()=>{activeCategory=el.dataset.category;render();}));
document.getElementById("sort-bids").addEventListener("change",e=>{sort=e.target.value;render();});
modal.addEventListener("click",e=>{if(e.target===modal)modal.close();});
document.querySelectorAll(".top-nav__links a,.top-nav__actions button").forEach(el=>{el.addEventListener("click",e=>{if(el.textContent.trim()==="Opportunities"){e.preventDefault();feed.scrollIntoView({behavior:"smooth"});}else{e.preventDefault();modal.innerHTML='<div class="modal-head"><span class="demo-pill">Product roadmap</span><button class="modal-close" type="button">✕</button></div><h2>'+esc(el.textContent.trim())+' — coming soon</h2><p>This interactive portfolio demo focuses on opportunity discovery. Account access, vendor onboarding, compliance management, and support workflows are proposed features, not live services.</p>';modal.showModal();}})});
render();
})();