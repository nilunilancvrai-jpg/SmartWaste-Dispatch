(() => {
  const api=window.SmartWaste.data;
  const $=id=>document.getElementById(id);
  let bins=[],workers=[],assignments=[],history=[],map=null,binMarkers=[],supervisorMarker=null;

  const time=v=>v?new Date(v).toLocaleString():'—';
  function option(select,value,label){
    const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o);
  }

  function initSupervisorMap(){
    if(map)return;
    const el=$('supervisorMap');
    if(!el||!window.L||!window.SmartWaste.mapMarkers)return;
    map=L.map(el,{zoomControl:true}).setView([12.956,77.716],12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    setTimeout(()=>map.invalidateSize(true),120);
  }

  function renderSupervisorMap(){
    if(!map)return;
    binMarkers.forEach(marker=>map.removeLayer(marker));
    binMarkers=[];
    const valid=bins.filter(b=>Number.isFinite(b.lat)&&Number.isFinite(b.lng));
    valid.forEach(bin=>{
      const marker=L.marker([bin.lat,bin.lng],{
        icon:window.SmartWaste.mapMarkers.binIcon(bin.fill,bin.status,false),
        title:`${bin.name} · ${bin.fill}% full`
      }).addTo(map);
      const popup=document.createElement('div');
      popup.className='bin-map-popup';
      const name=document.createElement('strong');name.textContent=bin.name;
      const address=document.createElement('div');address.textContent=bin.address;
      const fill=document.createElement('div');fill.textContent=`Fill level: ${bin.fill}%`;
      const status=document.createElement('div');
      status.textContent=bin.status==='available'
        ? (bin.fill<80?'Available · under 80%':bin.fill<95?'Near capacity':'Critical capacity')
        : 'Out of service';
      popup.append(name,address,fill,status);
      marker.bindPopup(popup);
      binMarkers.push(marker);
    });
    if(valid.length){
      const bounds=L.featureGroup(binMarkers).getBounds();
      if(bounds.isValid())map.fitBounds(bounds.pad(.12),{maxZoom:14});
      $('supervisorMapMessage').textContent=`Showing ${valid.length} of ${bins.length} registered bins. Select a bin pin to inspect its status.`;
    }else{
      $('supervisorMapMessage').textContent='No geocoded bins are available yet. Add latitude and longitude to bin records.';
    }
  }

  function locateSupervisor(){
    const btn=$('supervisorLocateBtn'),status=$('supervisorMapMessage');
    if(!navigator.geolocation){status.textContent='This browser does not support location services.';return;}
    btn.disabled=true;btn.textContent='Locating…';
    navigator.geolocation.getCurrentPosition(position=>{
      const point=[position.coords.latitude,position.coords.longitude];
      const icon=window.SmartWaste.mapMarkers.personIcon();
      if(supervisorMarker){supervisorMarker.setLatLng(point);supervisorMarker.setIcon(icon);}
      else supervisorMarker=L.marker(point,{icon,zIndexOffset:2000,title:'Supervisor current location'}).addTo(map).bindPopup('Your current location');
      const bounds=binMarkers.length?L.featureGroup([...binMarkers,supervisorMarker]).getBounds():L.latLngBounds([point]);
      map.fitBounds(bounds.pad(.15),{maxZoom:15});
      status.textContent=`Your location is shown on the operations map · GPS accuracy ±${Math.round(position.coords.accuracy)} m.`;
      btn.disabled=false;btn.innerHTML='<i class="ti ti-current-location"></i> Locate me';
    },error=>{
      status.textContent=`Could not get your location: ${error.message}. Allow location access and try again.`;
      btn.disabled=false;btn.innerHTML='<i class="ti ti-current-location"></i> Locate me';
    },{enableHighAccuracy:true,timeout:15000,maximumAge:10000});
  }

  function render(){
    $('totalBins').textContent=bins.length;
    const pending=bins.filter(b=>b.status==='available'&&b.fill>=80).length;
    $('pendingBins').textContent=pending;
    $('assignedTasks').textContent=assignments.filter(a=>!['collected','cancelled'].includes(a.status)).length;
    $('completedTasks').textContent=history.length;

    const binSelect=$('binSelect'),workerSelect=$('workerSelect');
    binSelect.replaceChildren();workerSelect.replaceChildren();
    option(binSelect,'','Select a bin');option(workerSelect,'','Select a worker');
    const activeBinIds=new Set(assignments.filter(a=>!['collected','cancelled'].includes(a.status)).map(a=>String(a.bin_id)));
    bins.filter(b=>b.status==='available'&&b.fill>=80&&!activeBinIds.has(String(b.id))).forEach(b=>option(binSelect,b.id,`${b.name} — ${b.fill}% full`));
    workers.forEach(w=>option(workerSelect,w.id,`${w.full_name||w.email} (${w.email})`));

    const list=$('supervisorBinList');list.replaceChildren();
    if(!bins.length)list.textContent='No bins are registered yet.';
    bins.forEach(b=>{
      const d=document.createElement('div');d.className='supervisor-bin-card';
      const active=assignments.find(a=>String(a.bin_id)===String(b.id)&&!['collected','cancelled'].includes(a.status));
      const info=document.createElement('p');
      info.textContent=`${b.name} · ${b.address} · ${b.fill}% · ${b.status} · ${active?'Assigned: '+(workers.find(w=>w.id===active.worker_id)?.email||active.worker_id)+' ('+active.status+')':'Unassigned'}`;
      const toggle=document.createElement('button');toggle.type='button';toggle.textContent=b.status==='available'?'Mark out of service':'Restore bin';
      toggle.addEventListener('click',async()=>{toggle.disabled=true;try{await api.setBinStatus(b.id,b.status==='available'?'out-of-service':'available');await refresh();}catch(e){alert(e.message);toggle.disabled=false;}});
      d.append(info,toggle);list.appendChild(d);
    });

    const body=$('workerTableBody');body.replaceChildren();
    if(!assignments.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='No assignments yet.';tr.appendChild(td);body.appendChild(tr);}
    else assignments.forEach(a=>{
      const b=bins.find(x=>String(x.id)===String(a.bin_id)),w=workers.find(x=>x.id===a.worker_id);
      const tr=document.createElement('tr');
      [w?.email||a.worker_id,b?.name||`Bin ${a.bin_id}`,a.status,time(a.updated_at||a.assigned_at)].forEach(v=>{
        const td=document.createElement('td');td.textContent=v;tr.appendChild(td);
      });
      body.appendChild(tr);
    });

    const hist=$('collectionHistory');hist.replaceChildren();
    if(!history.length)hist.textContent='No completed collections recorded yet.';
    history.forEach(h=>{
      const d=document.createElement('div');d.className='history-item';
      const strong=document.createElement('strong');strong.textContent=h.bin_name;
      const p=document.createElement('p');p.textContent=`Worker: ${workers.find(w=>w.id===h.worker_id)?.email||h.worker_id} · Previous fill: ${h.previous_fill}% · ${time(h.completed_at)}`;
      d.append(strong,p);hist.appendChild(d);
    });
    renderSupervisorMap();
  }

  async function refresh(){
    const results=await Promise.all([api.getBins(),api.getWorkers(),api.getAssignments(),api.getHistory()]);
    [bins,workers,assignments,history]=results;
    render();
  }

  $('assignBtn')?.addEventListener('click',async()=>{
    const msg=$('assignmentMessage');msg.textContent='';
    try{
      if(!$('binSelect').value||!$('workerSelect').value)throw new Error('Select both a bin and worker.');
      await api.assignTask($('binSelect').value,$('workerSelect').value);
      msg.textContent='Collection task assigned.';await refresh();
    }catch(e){msg.textContent=e.message;}
  });
  $('inviteWorkerBtn')?.addEventListener('click',async()=>{
    const msg=$('inviteWorkerMessage');msg.textContent='';
    const email=$('workerInviteEmail').value.trim();
    try{
      if(!email)throw new Error('Enter a worker email.');
      const result=await api.inviteWorker(email,$('workerInviteName').value.trim());
      msg.textContent=result.registered?'Worker account authorized. Ask them to sign in again.':'Invitation saved. The worker must register using this exact email.';
      $('workerInviteEmail').value='';$('workerInviteName').value='';await refresh();
    }catch(e){msg.textContent=e.message;}
  });
  $('supervisorRefreshBtn')?.addEventListener('click',()=>refresh().catch(e=>alert(e.message)));
  $('supervisorLocateBtn')?.addEventListener('click',locateSupervisor);

  async function init(){
    if(map)return;
    try{
      initSupervisorMap();
      await refresh();
      setTimeout(()=>map?.invalidateSize(true),150);
    }catch(e){
      console.error(e);
      $('assignmentMessage').textContent='Could not load supervisor data: '+e.message;
      $('supervisorMapMessage').textContent='Could not load map data: '+e.message;
    }
  }
  document.addEventListener('smartwaste:authorized',init,{once:true});
  if(window.SmartWaste?.currentProfile?.role==='supervisor')init();
})();
