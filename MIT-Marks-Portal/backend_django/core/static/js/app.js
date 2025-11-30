/* ------------------------------------------------
   CLEAN + CORRECTED JS  (Teacher Dashboard)
---------------------------------------------------*/

let subjects=[
  {id:"s1",sem:"5",branch:"CSE",name:"Microcontrollers",code:"23CS54",credits:4},
  {id:"s2",sem:"5",branch:"CSE",name:"Data Communication",code:"23CS52",credits:3}
];

const el=id=>document.getElementById(id);

const semester=el("semester"),
      branch=el("branch"),
      section=el("section"),
      subjectSelect=el("subjectSelect");

const subjectCode=el("subjectCode"),
      subjectCredits=el("subjectCredits");

/* ---------------- REFRESH SUBJECT DROPDOWN ---------------- */
function refreshSubjectDropdown(){
  subjectSelect.innerHTML="<option value=''>— Select subject —</option>";
  subjects.forEach(s=>{
    if((semester.value && s.sem!==semester.value)||(branch.value && s.branch!==branch.value)) return;
    let o=document.createElement("option");
    o.value=s.id;
    o.textContent=`${s.name} (${s.code})`;
    subjectSelect.appendChild(o);
  });
}
semester.onchange = branch.onchange = refreshSubjectDropdown;

/* ---------------- SUBJECT SELECTION ---------------- */
subjectSelect.onchange=()=>{
  let s=subjects.find(x=>x.id===subjectSelect.value);
  if(!s){ subjectCode.value=""; subjectCredits.value=""; return; }
  subjectCode.value=s.code;
  subjectCredits.value=s.credits;
};

/* ---------------- CLEAR SELECTION ---------------- */
el("clearSelection").onclick=()=>{
  subjectSelect.value="";
  subjectCode.value="";
  subjectCredits.value="";
};

/* ---------------- ADD NEW SUBJECT ---------------- */
el("addSubject").onclick=()=>{
  const name=el("newSubName").value.trim();
  const code=el("newSubCode").value.trim();
  const credits=el("newSubCredits").value;

  if(!name||!code||!credits){ 
    alert("Fill all fields"); 
    return; 
  }

  const s={
    id:"s"+Math.random(),
    sem:semester.value,
    branch:branch.value,
    name,
    code,
    credits:Number(credits)
  };

  subjects.push(s);
  refreshSubjectDropdown();
  subjectSelect.value=s.id;
  subjectSelect.onchange();

  el("newSubName").value="";
  el("newSubCode").value="";
  el("newSubCredits").value="";

  alert("Subject added");
};

/* ------------------------------------------------
   TEMPLATE DOWNLOAD  (WITH FORMULAS)
--------------------------------------------------- */
el("downloadTemplate").onclick = async () => {

  if (!semester.value || !branch.value || !section.value) {
    alert("Please select Semester, Branch and Section first.");
    return;
  }
  if (!subjectCode.value) {
    alert("Select subject first.");
    return;
  }

  // Fetch student list
  let resp;
  try {
    resp = await fetch(
      `http://localhost:3000/api/students?sem=${semester.value}&branch=${branch.value}&section=${section.value}`
    );
  } catch (err) {
    alert("Server error: " + err.message);
    return;
  }

  const students = await resp.json();
  if (!Array.isArray(students) || students.length === 0) {
    alert("No students found. Add student details first.");
    return;
  }

  /* ---------------- COLUMNS BASED ON CREDITS ---------------- */
  const credits = Number(subjectCredits.value);
  let cols;

  if (credits === 4) {
    cols = [
      "Sl. No", "USN", "NAME",
      "IA1 (40)", "IA2 (40)", "IA3 (40)",
      "Asg1 (25)", "Asg2 (25)",
      "Lab CIE (15)", "Lab Test (10)",
      "Total CIE (50)"
    ];
  } else {
    cols = [
      "Sl. No", "USN", "NAME",
      "IA1 (40)", "IA2 (40)", "IA3 (40)",
      "Asg1 (25)", "Asg2 (25)",
      "Total CIE (50)"
    ];
  }

  const totalColIndex = cols.length - 1;

  /* ---------------- BUILD STUDENT ROWS ---------------- */
  const dataRows = students.map((s, i) => {
    const row = {};
    cols.forEach(c => row[c] = "");
    row["Sl. No"] = i + 1;
    row["USN"] = s.usn;
    row["NAME"] = s.name;
    return row;
  });

  /* ---------------- METADATA ROWS ---------------- */
  const meta = [
    ["Teacher", el("teacherName").value],
    ["Semester", semester.value],
    ["Branch", branch.value],
    ["Section", section.value],
    ["Subject", subjectSelect.options[subjectSelect.selectedIndex].text],
    ["Subject Code", subjectCode.value],
    ["Credits", subjectCredits.value],
    []
  ];

  /* ---------------- BUILD SHEET ---------------- */
  const sheet = XLSX.utils.aoa_to_sheet(meta);
  XLSX.utils.sheet_add_json(sheet, dataRows, { origin: meta.length });

  /* ---------------- FORMULA CREATOR ---------------- */
  function colLetter(idx) {
    let s = "";
    idx++;
    while (idx > 0) {
      let m = (idx - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      idx = Math.floor((idx - 1) / 26);
    }
    return s;
  }

  /* ---------------- APPLY FORMULAS ---------------- */
  const dataStart = meta.length + 1;

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataStart + i;
    let formula;

    if (credits === 4) {
      const startCol = colLetter(cols.indexOf("IA1 (40)"));
      const endCol = colLetter(cols.indexOf("Lab Test (10)"));
      formula = `=IFERROR(SUM(${startCol}${r}:${endCol}${r}),"")`;
    } else {
      const startCol = colLetter(cols.indexOf("IA1 (40)"));
      const endCol = colLetter(cols.indexOf("Asg2 (25)"));
      formula = `=IFERROR(SUM(${startCol}${r}:${endCol}${r}),"")`;
    }

    const cell = XLSX.utils.encode_cell({ r: r - 1, c: totalColIndex });
    sheet[cell] = { t: 'n', f: formula };
  }

  /* ---------------- SAVE FILE ---------------- */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Template");

  const filename = `Template_${subjectCode.value}_Sem${semester.value}_Sec${section.value}.xlsx`;
  XLSX.writeFile(wb, filename);

};

/* ------------------------------------------------
   UPLOAD + PREVIEW
--------------------------------------------------- */

let parsed=[];

el("fileInput").onchange=(e)=>{
  let f=e.target.files[0];
  if(!f) return;

  let reader=new FileReader();
  reader.onload=(ev)=>{
    let wb=XLSX.read(new Uint8Array(ev.target.result),{type:"array"});
    let ws=wb.Sheets[wb.SheetNames[0]];
    parsed=XLSX.utils.sheet_to_json(ws,{defval:""});
    renderPreview(parsed);
    el("confirmUpload").disabled = parsed.length === 0;
  };
  reader.readAsArrayBuffer(f);
};

function renderPreview(rows){
  let wrap=el("previewWrap"),table=el("previewTable");
  wrap.style.display="block";
  table.innerHTML="";

  if(!rows.length){
    table.innerHTML="<tr><td>No data</td></tr>";
    return;
  }

  let header=Object.keys(rows[0]);
  let thead="<thead><tr>"+header.map(h=>`<th>${h}</th>`).join("")+"</tr></thead>";

  let tbody="<tbody>";
  rows.forEach(r=>{
    tbody+="<tr>"+header.map(h=>`<td>${r[h]}</td>`).join("")+"</tr>";
  });
  tbody+="</tbody>";

  table.innerHTML=thead+tbody;
}

el("confirmUpload").onclick=async()=>{
  const body={ rows: parsed };

  const res=await fetch("http://localhost:3000/upload-marks",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(body)
  });

  const data=await res.json();
  alert("Uploaded: "+(data.imported ?? parsed.length));
};
