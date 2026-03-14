const socket = typeof io !== 'undefined' ? io() : null;
const clock = document.getElementById('liveClock');
if (clock) setInterval(() => clock.textContent = new Date().toLocaleString(), 1000);

document.querySelectorAll('.metric[data-count]').forEach((el)=>{let i=0;const t=Number(el.dataset.count||0);const step=Math.max(1,Math.ceil(t/30));const timer=setInterval(()=>{i+=step;el.textContent=Math.min(i,t);if(i>=t)clearInterval(timer);},20)});

const search = document.getElementById('searchPatients');
if (search) search.addEventListener('input', (e)=>{
  const q=e.target.value.toLowerCase();
  document.querySelectorAll('#patientTable tr').forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(q)?'':'none');
});

if (socket) {
  socket.on('queue:updated', (queue) => {
    const liveToken = document.getElementById('liveToken');
    const called = queue.find((q) => q.status === 'called') || queue[0];
    if (liveToken && called) liveToken.textContent = called.token;
    const board = document.getElementById('queueBoard');
    if (board) board.innerHTML = queue.map(q=>`<div class="queue-item"><span>${q.token} · ${q.name} · ${q.department} · ETA ${q.eta}m</span><span class="badge ${q.status}">${q.status}</span></div>`).join('');
  });
}

if (window.dashboardData && document.getElementById('trendChart')) {
  const p = window.dashboardData.patients;
  const q = window.dashboardData.queue;
  new Chart(document.getElementById('trendChart'), {type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Patients',data:[12,18,16,22,20,24,p.length],borderColor:'#2ac8ff'}]}});
  const deptCount = {};
  q.forEach(x=>deptCount[x.department]=(deptCount[x.department]||0)+1);
  new Chart(document.getElementById('deptChart'), {type:'bar',data:{labels:Object.keys(deptCount),datasets:[{label:'Queue Load',data:Object.values(deptCount),backgroundColor:'#2f89ff'}]}});
  new Chart(document.getElementById('bedChart'), {type:'doughnut',data:{labels:['Available','Occupied'],datasets:[{data:[window.dashboardData.beds.availableBeds, window.dashboardData.beds.occupiedBeds],backgroundColor:['#53d399','#ff6b7a']}]}});
}

if (window.reportData && document.getElementById('patientTrend')) {
  new Chart(document.getElementById('patientTrend'), {type:'line',data:{labels:['8AM','10AM','12PM','2PM','4PM'],datasets:[{label:'Patient Flow',data:[8,14,22,19,window.reportData.patients.length],borderColor:'#2ac8ff'}]}});
  new Chart(document.getElementById('doctorLoad'), {type:'bar',data:{labels:window.reportData.doctors.map(d=>d.name.split(' ')[1]),datasets:[{label:'Consultations',data:window.reportData.doctors.map(()=>Math.floor(Math.random()*12+3)),backgroundColor:'#2f89ff'}]}});
  new Chart(document.getElementById('revenueTrend'), {type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri'],datasets:[{label:'Revenue',data:[22000,28000,26000,32000,window.reportData.bills.reduce((s,b)=>s+Number(b.grandTotal||0),0)],borderColor:'#53d399'}]}});
}
