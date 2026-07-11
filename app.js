/* ============================================================
   Writing Warm-Up — App Logic
   Requires core.js + term1.js + term2.js + term3.js + term4.js
   to be loaded first.
   ============================================================ */
const ALL_TERMS={1:TERM1,2:TERM2,3:TERM3,4:TERM4};

/* ===== STATE ===== */
let activeTerm=1,activeWeek=1,activeDay="Monday",stageIndex=0,curriculumOpen=false;
let quizPhase="setup",currentQ=0,scores={Tui:0,Kiwi:0},answered=false;

/* ===== HELPERS ===== */
function hl(s){return(s||"").replace(/\*\*(.+?)\*\*/g,'<span class="focus-word">$1</span>');}
function safe(s){return(s||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");}
function openFS(r){document.getElementById("fsText").innerHTML=hl(r);document.getElementById("fsOverlay").classList.add("open");}
function closeFS(){document.getElementById("fsOverlay").classList.remove("open");}
function ps(t,i){return`<div class="plan-section"><div class="plan-section__title">${t}</div>${i}</div>`;}
function currentTeam(){return["Tui","Kiwi"][currentQ%2];}

/* ===== WEEK SWITCH ===== */
function switchTerm(t){
  activeTerm=t;activeWeek=1;activeDay="Monday";stageIndex=0;curriculumOpen=false;
  quizPhase="setup";currentQ=0;scores={Tui:0,Kiwi:0};answered=false;
  document.querySelectorAll(".term-btn").forEach((b,i)=>b.classList.toggle("active",i+1===t));
  buildWeekBtns();renderTabs();renderDay();
}
function buildWeekBtns(){
  const wc=Object.keys(ALL_TERMS[activeTerm]).length;
  const sel=document.getElementById("weekSel");
  sel.innerHTML='<span class="week-selector__label">Week</span>'+
    Array.from({length:wc},(_,i)=>`<button class="week-btn${i+1===activeWeek?' active':''}" onclick="switchWeek(${i+1})">${i+1}</button>`).join('');
}
function switchWeek(n){
  activeWeek=n;activeDay="Monday";stageIndex=0;curriculumOpen=false;
  quizPhase="setup";currentQ=0;scores={Tui:0,Kiwi:0};answered=false;
  buildWeekBtns();renderTabs();renderDay();
}

/* ===== TABS ===== */
function renderTabs(){
  const tabs=document.getElementById("dayTabs");tabs.innerHTML="";
  ["Monday","Tuesday","Wednesday","Thursday","Friday"].forEach(day=>{
    const meta=DAY_META[day];const btn=document.createElement("button");
    btn.className="day-tab"+(day===activeDay?" active":"");
    btn.innerHTML=`<span class="dot" style="background:${meta.color}"></span>${day}`;
    btn.onclick=()=>{activeDay=day;stageIndex=0;curriculumOpen=false;quizPhase="setup";currentQ=0;scores={Tui:0,Kiwi:0};answered=false;renderTabs();renderDay();};
    tabs.appendChild(btn);
  });
}

/* ===== CURRICULUM ===== */
function toggleCurriculum(){curriculumOpen=!curriculumOpen;renderDay();}
function toggleAo(i){document.getElementById("aoTag"+i).classList.toggle("open");document.getElementById("aoDetail"+i).classList.toggle("open");}
function curriculumHtml(day){
  if(!curriculumOpen)return"";
  const tags=day.aos.map((ao,i)=>`<button class="ao-tag" onclick="toggleAo(${i})" id="aoTag${i}">${ao.code}</button>`).join("");
  const details=day.aos.map((ao,i)=>`<div class="ao-detail" id="aoDetail${i}"><strong>${ao.label}.</strong> ${ao.detail}</div>`).join("");
  return`<div class="curriculum-panel open"><div class="curriculum-panel__intro">NZ Curriculum standards this lesson addresses — tap a standard to read it in full. Use this to record coverage in your planning overview.</div><div class="ao-tags">${tags}</div>${details}<div class="curriculum-panel__record">📋 ${day.aos.length} standard${day.aos.length===1?"":"s"} covered in this lesson.</div></div>`;
}

/* ===== LESSON HEADER ===== */
function headerHtml(dayName,day,meta){
  return`<div class="lesson-header"><div class="lesson-header__meta">
    <span class="lesson-header__badge" style="background:${meta.color}">${dayName}</span>
    Term ${activeTerm} · Week ${activeWeek} · ${meta.label}
    ${day.values?`<span class="values-tag">♥ ${day.values}</span>`:""}
  </div><div class="lesson-header__topic">${day.topic}</div></div>
  <div class="action-row">
    <button class="btn btn--plan" onclick="openModal('${dayName}')">🗒 Detailed Lesson Plan</button>
    <button class="btn btn--curriculum ${curriculumOpen?"active":""}" onclick="toggleCurriculum()">📋 Curriculum Standards (${day.aos.length})</button>
  </div>${curriculumHtml(day)}`;
}

/* ===== STAGE CARDS ===== */
const SK=["iDo","weDo","youDo"],SC=["var(--i-do)","var(--we-do)","var(--you-do)"],SI=["①","②","③"];

function progressHtml(){
  return`<div class="stage-progress">`+["I Do","We Do","You Do"].map((l,i)=>
    `<div class="stage-progress__step ${i===stageIndex?"active":""} ${i<stageIndex?"done":""}" style="color:${SC[i]}">
      <span class="stage-progress__icon">${SI[i]}</span><span class="stage-progress__label">${l}</span>
    </div>`).join("")+`</div>`;
}

function stageHtml(stage,color){
  let h=`<div class="stage-card"><div class="stage-card__header" style="color:${color}"><h2>${stage.title}</h2></div><div class="stage-card__body">`;
  h+=`<div class="instruction-block">${stage.instruction}</div>`;
  if(stage.example)h+=`<div class="example-box clickable-box" style="color:${color}" onclick="openFS('${safe(stage.example)}')"><div class="example-box__label">Example — tap to enlarge</div>${hl(stage.example)}</div>`;
  if(stage.demonstration)h+=`<div class="demo-box"><div class="demo-box__label">Demonstration</div>${hl(stage.demonstration)}</div>`;
  if(stage.tip)h+=`<div class="tip-box"><span>💡</span><div>${stage.tip}</div></div>`;
  if(stage.sentences)h+=`<ul class="sentence-list">`+stage.sentences.map(s=>`<li onclick="openFS('${safe(s)}')">${hl(s)}</li>`).join("")+`</ul>`;
  if(stage.prompt)h+=`<div class="prompt-line">${stage.prompt}</div>`;
  if(stage.tasks)h+=`<ul class="task-list">`+stage.tasks.map(t=>`<li class="${t.startsWith("✦")?"bonus":""}" onclick="openFS('${safe(t)}')">${hl(t)}</li>`).join("")+`</ul>`;
  return h+`</div></div>`;
}

function navHtml(){
  const isLast=stageIndex===2,isFri=activeDay==="Friday";
  return`<div class="stage-nav">
    <button class="stage-nav__btn stage-nav__btn--prev" onclick="prevStage()" ${stageIndex===0?"disabled":""}>← Back</button>
    <button class="stage-nav__btn ${isLast?"stage-nav__btn--quiz":"stage-nav__btn--next"}" onclick="nextStage()">
      ${isLast?(isFri?"Start Quiz 🐦":"Lesson Complete ✓"):"Next →"}
    </button>
  </div>`;
}

function completeHtml(){
  const day=ALL_TERMS[activeTerm][activeWeek].data[activeDay];
  return`<div class="complete-screen"><span class="complete-screen__icon">🎉</span>
    <div class="complete-screen__heading">Nicely done!</div>
    <div class="complete-screen__sub">Today's ${activeDay} lesson — <strong>${day.topic}</strong> — is complete. Wonderful work!</div>
    <div class="complete-screen__actions">
      <button class="btn" onclick="stageIndex=0;renderDay();">↺ Review Lesson</button>
      <button class="btn btn--plan" onclick="openModal('${activeDay}')">🗒 Detailed Lesson Plan</button>
    </div></div>`;
}

/* ===== QUIZ ===== */
function quizSetupHtml(){
  return`<div class="quiz-setup"><h2>🐦 Quiz Time! 🥝</h2>
    <p>16 questions on everything from this week. Teams alternate — confer quietly, then give your answer!</p>
    <div class="team-row">
      <div class="team-card team-card--tui"><div class="team-card__bird">🐦</div><div class="team-card__name">Team Tui</div><div class="team-card__sub">Questions 1, 3, 5, 7, 9, 11, 13, 15</div></div>
      <div class="team-card team-card--kiwi"><div class="team-card__bird">🥝</div><div class="team-card__name">Team Kiwi</div><div class="team-card__sub">Questions 2, 4, 6, 8, 10, 12, 14, 16</div></div>
    </div>
    <button class="btn btn--plan" style="font-size:.9rem;padding:.75rem 2rem" onclick="startQuiz()">🚀 Start the Quiz!</button>
  </div>`;
}

function scoreBarHtml(){
  const t=currentTeam();
  return`<div class="score-bar">
    <div class="score-team score-team--tui"><span style="font-size:1.5rem">🐦</span><div><div class="score-team__name">Team Tui</div><div class="score-team__pts">${scores.Tui}</div></div></div>
    <div class="score-divider">vs</div>
    <div class="score-team score-team--kiwi"><div><div class="score-team__name">Team Kiwi</div><div class="score-team__pts">${scores.Kiwi}</div></div><span style="font-size:1.5rem">🥝</span></div>
  </div>
  <div class="q-progress">Question ${currentQ+1} of ${ALL_TERMS[activeTerm][activeWeek].quiz.length} — ${t==="Tui"?"🐦 Team Tui's turn":"🥝 Team Kiwi's turn"}</div>`;
}

function questionCardHtml(){
  const q=ALL_TERMS[activeTerm][activeWeek].quiz[currentQ];const t=currentTeam();
  return`<div class="q-card">
    <div class="q-card__whose q-card__whose--${t.toLowerCase()}">${t==="Tui"?"🐦":"🥝"} Team ${t}'s Question</div>
    <div class="q-card__body">
      <div class="q-card__q">${q.q}</div>
      <div class="q-card__options" id="optContainer">${q.opts.map((o,i)=>`<button class="q-opt" id="opt${i}" onclick="pickAnswer(${i})">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div>
      <div class="q-card__feedback" id="qFeedback"></div>
      <div class="q-card__next" id="qNext"><button class="btn btn--plan" onclick="nextQuestion()">${currentQ+1<ALL_TERMS[activeTerm][activeWeek].quiz.length?"Next Question →":"See Results 🏆"}</button></div>
    </div>
  </div>`;
}

function pickAnswer(i){
  if(answered)return;answered=true;
  const q=ALL_TERMS[activeTerm][activeWeek].quiz[currentQ];const correct=i===q.ans;const t=currentTeam();
  if(correct)scores[t]++;
  q.opts.forEach((_,idx)=>{const el=document.getElementById("opt"+idx);el.disabled=true;
    if(idx===q.ans)el.classList.add(correct&&idx===i?"correct":"reveal-correct");
    else if(idx===i)el.classList.add("wrong");});
  const fb=document.getElementById("qFeedback");
  fb.className="q-card__feedback show "+(correct?"correct":"wrong");
  fb.innerHTML=correct?`✅ Correct! ${q.explanation}`:`❌ Not quite — the answer was <strong>${String.fromCharCode(65+q.ans)}. ${q.opts[q.ans]}</strong>. ${q.explanation}`;
  document.getElementById("qNext").className="q-card__next show";
  document.getElementById("scoreBar").innerHTML=scoreBarHtml();
}

function nextQuestion(){currentQ++;answered=false;if(currentQ>=ALL_TERMS[activeTerm][activeWeek].quiz.length){quizPhase="done";renderQuiz();return;}renderQuiz();}

function quizFinalHtml(){
  const tie=scores.Tui===scores.Kiwi;const w=scores.Tui>scores.Kiwi?"Team Tui 🐦":"Team Kiwi 🥝";
  return`<div class="quiz-final">
    <div class="quiz-final__trophy">${tie?"🤝":"🏆"}</div>
    <div class="quiz-final__heading">${tie?"It's a Draw!":w+" Wins!"}</div>
    <div class="quiz-final__winner">${tie?"Both teams played brilliantly — a perfect tie!":"Congratulations to "+w+"! Both teams showed fantastic effort and real knowledge this week."}</div>
    <div class="quiz-final__scoreboard">
      <div class="quiz-final__team quiz-final__team--tui"><div class="quiz-final__team-name">🐦 Team Tui</div><div class="quiz-final__team-pts">${scores.Tui}</div></div>
      <div class="quiz-final__team quiz-final__team--kiwi"><div class="quiz-final__team-name">🥝 Team Kiwi</div><div class="quiz-final__team-pts">${scores.Kiwi}</div></div>
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <button class="btn" onclick="quizPhase='setup';currentQ=0;scores={Tui:0,Kiwi:0};answered=false;renderQuiz();">↺ Play Again</button>
      <button class="btn btn--plan" onclick="openModal('Friday')">🗒 Detailed Lesson Plan</button>
    </div>
  </div>`;
}

function startQuiz(){quizPhase="playing";currentQ=0;scores={Tui:0,Kiwi:0};answered=false;renderQuiz();}

function renderQuiz(){
  const day=ALL_TERMS[activeTerm][activeWeek].data["Friday"];const meta=DAY_META["Friday"];
  let html=headerHtml("Friday",day,meta);
  if(quizPhase==="setup")html+=quizSetupHtml();
  else if(quizPhase==="done")html+=quizFinalHtml();
  else html+=`<div class="quiz-arena"><div id="scoreBar">${scoreBarHtml()}</div>${questionCardHtml()}</div>`;
  document.getElementById("main").innerHTML=html;
}

/* ===== DAY RENDER ===== */
function renderDay(){
  if(activeDay==="Friday"){renderQuiz();return;}
  const day=ALL_TERMS[activeTerm][activeWeek].data[activeDay];const meta=DAY_META[activeDay];
  let html=headerHtml(activeDay,day,meta);
  if(stageIndex<3){html+=progressHtml();html+=stageHtml(day[SK[stageIndex]],SC[stageIndex]);html+=navHtml();}
  else{html+=completeHtml();}
  document.getElementById("main").innerHTML=html;
}
function nextStage(){if(activeDay==="Friday"&&stageIndex===2){quizPhase="setup";renderQuiz();return;}if(stageIndex<3)stageIndex++;renderDay();}
function prevStage(){if(stageIndex>0)stageIndex--;renderDay();}

/* ===== PLAN MODAL ===== */
function openModal(dayName){
  const day=ALL_TERMS[activeTerm][activeWeek].data[dayName];const p=day.plan;
  document.getElementById("modalEyebrow").textContent=`Detailed Lesson Plan · Term ${activeTerm}, Week ${activeWeek}, ${dayName}`;
  document.getElementById("modalTitle").textContent=day.topic;
  let b="";
  b+=ps("Context",`<div class="context-grid">
    <div class="context-item"><div class="context-item__label">Unit</div><div class="context-item__value">${p.context.unit}</div></div>
    <div class="context-item"><div class="context-item__label">Lesson</div><div class="context-item__value">${p.context.lessonNumber}</div></div>
    <div class="context-item"><div class="context-item__label">Year Group</div><div class="context-item__value">${p.context.yearGroup}</div></div>
    <div class="context-item"><div class="context-item__label">Duration</div><div class="context-item__value">${p.context.duration}</div></div>
    <div class="context-item"><div class="context-item__label">Class Size</div><div class="context-item__value">${p.context.classSize}</div></div>
    <div class="context-item"><div class="context-item__label">School Type</div><div class="context-item__value">${p.context.schoolType}</div></div>
  </div>`);
  b+=ps("Curriculum Alignment",`<ul class="plan-list">${p.curriculumAlignment.map(i=>`<li>${i}</li>`).join("")}</ul>`);
  b+=ps("Learning Objectives (WALT)",`<ul class="plan-list">${p.walt.map(i=>`<li>${i}</li>`).join("")}</ul>`);
  b+=ps("Success Criteria",`<ul class="plan-list">${p.successCriteria.map(i=>`<li>${i}</li>`).join("")}</ul>`);
  b+=ps("Lesson Outline &amp; Timing",`<table class="timing-table"><thead><tr><th style="width:70px">Time</th><th>Activity</th><th>Description</th></tr></thead><tbody>
    ${p.timing.map(t=>`<tr><td class="time-col">${t.time}</td><td class="activity-col">${t.title}<br><span class="phase-badge phase-${t.phase.toLowerCase().replace(" ","-")}">${t.phase}</span></td><td>${t.description}</td></tr>`).join("")}
  </tbody></table>`);
  b+=ps("Resources Required",`<ul class="plan-list">${p.resources.map(i=>`<li>${i}</li>`).join("")}</ul>`);
  b+=ps("Assessment &amp; Monitoring",`<ul class="plan-list">${p.assessment.map(i=>`<li>${i}</li>`).join("")}</ul>`);
  b+=ps("Differentiation Strategies",`<div class="diff-grid">${p.differentiation.map(d=>`<div class="diff-card"><div class="diff-card__label">${d.label}</div><p>${d.note}</p></div>`).join("")}</div>`);
  b+=ps(`Values Integration — ${p.valuesIntegration.heading}`,`<div class="values-box">${p.valuesIntegration.notes.map(n=>`<p>${n}</p>`).join("")}</div>`);
  b+=ps("Teacher Reflection Prompts",`<ul class="plan-list">${p.reflectionPrompts.map(i=>`<li>${i}</li>`).join("")}</ul>`);
  document.getElementById("modalBody").innerHTML=b;
  document.getElementById("planModal").classList.add("open");
}
function closeModal(){document.getElementById("planModal").classList.remove("open");}

/* ===== INIT ===== */
buildWeekBtns();renderTabs();renderDay();
