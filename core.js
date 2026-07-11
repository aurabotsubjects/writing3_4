/* ============================================================
   Writing Warm-Up — Core Helpers
   Shared functions used to build lesson data in term1.js,
   term2.js, term3.js, term4.js. Must load BEFORE those files.
   ============================================================ */
const DAY_META={Monday:{color:"var(--mon)",label:"Word Choice"},Tuesday:{color:"var(--tue)",label:"Grammar"},Wednesday:{color:"var(--wed)",label:"Sentence Building"},Thursday:{color:"var(--thu)",label:"Checking"},Friday:{color:"var(--fri)",label:"Quiz Day"}};
function g(topic,nzLink,iDo,weDo,youDo,aos,plan,values){return{topic,nzLink,iDo,weDo,youDo,aos,plan,values};}
function ctx(u,n,y,d,c,s){return{unit:u,lessonNumber:n,yearGroup:y,duration:d,classSize:c,schoolType:s};}
