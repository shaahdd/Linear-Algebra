const buildBtn = document.querySelector(".build");
const solveBtn = document.querySelector(".solve");
const clearBtn = document.querySelector(".clear");
const table = document.getElementById("matrix_table");
const output = document.getElementById("show_output");

function fmtNum(x) {
  if (!isFinite(x)) return String(x);
  if (Math.abs(x) < 1e-9) return "0";
  return Number.parseFloat(x).toFixed(2);
}

function clearOutput() {
  output.innerHTML = "";
}

function createCard(title, contentNode) {
  const card = document.createElement("div");
  card.className = "step-card-main";
  const h = document.createElement("div");
  h.className = "step-title-main";
  h.textContent = title;
  card.appendChild(h);
  card.appendChild(contentNode);
  return card;
}

function createSubCard(text) {
  const card = document.createElement("div");
  card.className = "step-card-sub";
  card.textContent = text;
  return card;
}

function matrixToTableHTML(M) {
  const tbl = document.createElement("table");
  tbl.className = "matrix_table";
  for (let i = 0; i < M.length; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < M[i].length; j++) {
      const td = document.createElement("td");
      const inp = document.createElement("input");
      inp.type = "number";
      inp.value = fmtNum(M[i][j]);
      inp.disabled = true;
      tr.appendChild(td);
      td.appendChild(inp);
    }
    tbl.appendChild(tr);
  }
  return tbl;
}

buildBtn.addEventListener("click", () => {
  const rows = parseInt(document.getElementById("rows").value);
  const cols = parseInt(document.getElementById("cols").value);
  table.innerHTML = "";
  clearOutput();
  if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows <= 0 || cols <= 0) return;
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < cols; c++) {
      const td = document.createElement("td");
      const inp = document.createElement("input");
      inp.type = "number";
      inp.step = "any";
      td.appendChild(inp);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
});

function readMatrix() {
  if (!table.rows.length) return [];
  const rows = table.rows.length;
  const cols = table.rows[0].cells.length;
  const A = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const val = table.rows[i].cells[j].children[0].value;
      A[i][j] = val === "" ? 0 : parseFloat(val);
    }
  }
  return A;
}

function isSquare(A) { return A.length > 0 && A.length === A[0].length; }

function detNumeric(A) {
  const n = A.length;
  if (n === 0) return 0;
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0]*A[1][1]-A[0][1]*A[1][0];
  let det = 0;
  for (let col=0; col<n; col++) {
    const sub = [];
    for (let i=1;i<n;i++){
      const row = [];
      for (let j=0;j<n;j++) if(j!==col) row.push(A[i][j]);
      sub.push(row);
    }
    det += ((col%2===0?1:-1)*A[0][col]*detNumeric(sub));
  }
  return det;
}

function determinantSteps(A) {
  const n = A.length;
  const mainContent = document.createElement("div");
  let det = 0;
  const terms = [];

  for (let col = 0; col < n; col++) {
    const M = [];
    for (let i = 1; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) if (j !== col) row.push(A[i][j]);
      M.push(row);
    }

    const minorDet = detNumeric(M);
    const sign = (col % 2 === 0) ? 1 : -1;
    const cofactorVal = sign * minorDet;

    const termVal = A[0][col] * cofactorVal;
    terms.push(termVal);
    det += termVal;

    mainContent.appendChild(createSubCard(
      `cofactor(0,${col}) = (${sign>=0?"+":"-"}1)*det(minor) = ${cofactorVal}`
    ));
    mainContent.appendChild(createSubCard(
      `term(col ${col}) = ${A[0][col]} * ${cofactorVal} = ${termVal}`
    ));
  }

  mainContent.appendChild(createSubCard(
    `det(A) = ${terms.join(" + ")} = ${det}`
  ));

  output.appendChild(createCard("Determinant Step", mainContent));
  return det;
}

function cofactorsMatrixSteps(A){
  const n = A.length;
  const mainContent = document.createElement("div");
  const Cof = Array.from({length: n}, () => Array(n).fill(0));

  for(let i = 0; i < n; i++){
    for(let j = 0; j < n; j++){
      const M = [];
      for(let r = 0; r < n; r++){
        if(r === i) continue;
        const row = [];
        for(let c = 0; c < n; c++) if(c !== j) row.push(A[r][c]);
        M.push(row);
      }

      let minorCalc = "";
      if(M.length === 2){
        minorCalc = `${M[0][0]}*${M[1][1]} - ${M[0][1]}*${M[1][0]}`;
      } else {
        minorCalc = `determinant of submatrix`;
      }

      const minorDet = detNumeric(M);
      const sign = ((i+j) % 2 === 0) ? 1 : -1;
      const val = sign * minorDet;
      Cof[i][j] = val;

      mainContent.appendChild(createSubCard(
        `cofactor(${i},${j}) = (${sign>=0?"+":"-"}1)*(${minorCalc}) = ${val}`
      ));
    }
  }

  mainContent.appendChild(matrixToTableHTML(Cof));
  output.appendChild(createCard("Cofactor Matrix Step", mainContent));
  return Cof;
}

function adjointSteps(Cof){
  const n=Cof.length;
  const mainContent=document.createElement("div");
  const Adj=Array.from({length:n},()=>Array(n).fill(0));
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) Adj[j][i]=Cof[i][j];
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) mainContent.appendChild(createSubCard(`adj(${i},${j}) = ${Adj[i][j]}`));
  mainContent.appendChild(matrixToTableHTML(Adj));
  output.appendChild(createCard("Adjoint Matrix Step", mainContent));
  return Adj;
}

function inverseSteps(Adj,det){
  const n=Adj.length;
  const mainContent=document.createElement("div");
  const Inv=Array.from({length:n},()=>Array(n).fill(0));
  mainContent.appendChild(createSubCard(`A^-1 = 1 / ${det} * Adj(A)`));
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    const val = Adj[i][j]/det;
    Inv[i][j]=val;
    mainContent.appendChild(createSubCard(`inv(${i},${j}) = ${Adj[i][j]}/${det} = ${fmtNum(val)}`));
  }
  mainContent.appendChild(matrixToTableHTML(Inv));
  output.appendChild(createCard("Inverse Matrix Step", mainContent));
  return Inv;
}

solveBtn.addEventListener("click",()=>{
  clearOutput();
  const A=readMatrix();
  if(!A.length){ output.appendChild(createCard("Error", createSubCard("No matrix input."))); return; }
  if(!isSquare(A)){ output.appendChild(createCard("Error", createSubCard("Matrix is not square → no inverse."))); return; }

  output.appendChild(createCard("Original Matrix", matrixToTableHTML(A)));
  const det=determinantSteps(A);
  if(Math.abs(det)<1e-12){ output.appendChild(createCard("Result", createSubCard("Matrix is singular → no inverse."))); return; }

  const Cof=cofactorsMatrixSteps(A);
  const Adj=adjointSteps(Cof);
  inverseSteps(Adj,det);
});

clearBtn.addEventListener("click",()=>{
  table.innerHTML="";
  clearOutput();
  document.getElementById("rows").value="";
  document.getElementById("cols").value="";
});
