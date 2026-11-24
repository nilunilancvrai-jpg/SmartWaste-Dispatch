(() => {
  const api=window.SmartWaste.data, user=window.SmartWaste.currentUser;
  const mapEl=document.getElementById('workerMap'), listEl=document.getElementById('workerBinList'), panel=document.getElementById('selectedBin');
  const requiredEl=document.getElementById('requiredCount'), criticalEl=document.getElementById('criticalCount'), collectedEl=document.getElementById('collectedCount');
  const refreshBtn=document.getElementById('refreshWorkerBtn');
  let map=null, meMarker=null, markers=[], routeControl=null, position=null, tasks=[], bins=[], history=[], selectedTask=null, watchId=null, busy=false;
  const dist=(a,b)=>{const R=6371000,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng),v=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;return 2*R*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));};
  const binFor=id=>bins.find(b=>String(b.id)===String(id));
  const myTasks=()=>tasks.filter(t=>!['collected','cancelled'].includes(t.status)&&binFor(t.bin_id));
  function message(text){panel.textContent=text;}
  function clearRoute(){if(routeControl&&map){map.removeControl(routeControl);routeControl=null;}}
  function renderMap(){
    if(!map)return;
    markers.forEach(m=>map.removeLayer(m));
    markers=[];
    const assigned=myTasks();
    assigned.forEach(t=>{
      const b=binFor(t.bin_id);
      if(!b || !Number.isFinite(b.lat) || !Number.isFinite(b.lng))return;
      const marker=L.marker([b.lat,b.lng],{
        icon:window.SmartWaste.mapMarkers.binIcon(b.fill,b.status,selectedTask?.id===t.id),
        title:`${b.name} · ${b.fill}% full`,
        zIndexOffset: selectedTask?.id===t.id ? 1200 : 100
      }).addTo(map);
      const popup=document.createElement('div');
      popup.className='bin-map-popup';
      const strong=document.createElement('strong');strong.textContent=b.name;
      const address=document.createElement('div');address.textContent=b.address;
      const fill=document.createElement('div');fill.textContent=`Fill level: ${b.fill}%`;
      const task=document.createElement('div');task.textContent=`Task: ${t.status.replaceAll('-',' ')}`;
      popup.append(strong,address,fill,task);
      marker.bindPopup(popup);
      marker.on('click',()=>selectTask(t));
      markers.push(marker);
    });
    if(position){
      const ll=[position.lat,position.lng];
      if(meMarker){meMarker.setLatLng(ll);meMarker.setIcon(window.SmartWaste.mapMarkers.personIcon());}
      else meMarker=L.marker(ll,{icon:window.SmartWaste.mapMarkers.personIcon(),zIndexOffset:2000,title:'Worker current location'}).addTo(map).bindPopup('Your current location');
    }
  }
  function renderStats(){const active=myTasks();requiredEl.textContent=active.length;criticalEl.textContent=active.filter(t=>binFor(t.bin_id)?.fill>=95).length;const today=new Date();today.setHours(0,0,0,0);collectedEl.textContent=history.filter(h=>new Date(h.completed_at)>=today).length;}
  function renderList(){const active=myTasks();listEl.replaceChildren();if(!active.length){listEl.textContent='No active collection tasks are assigned to you.';return;}
    active.forEach(t=>{const b=binFor(t.bin_id),card=document.createElement('button');card.type='button';card.className='worker-action-btn';card.setAttribute('aria-label', `${b.name}, ${b.fill}% full, ${t.status}`);const title=document.createElement('strong');title.textContent=b.name;const detail=document.createElement('small');detail.textContent=`${b.fill}% full · ${t.status.replaceAll('-',' ')}`;card.append(title,detail);card.addEventListener('click',()=>selectTask(t));listEl.appendChild(card);});
  }
  function selectTask(task){selectedTask=task;const b=binFor(task.bin_id);if(!b)return;renderMap();renderSelected();if(map)map.setView([b.lat,b.lng],16);}
  function renderSelected(){if(!selectedTask)return;const b=binFor(selectedTask.bin_id);if(!b)return;
    const meters=position?dist(position,b):null, arrived=!!position&&meters<=10&&position.accuracy<=10;
    panel.innerHTML='';const title=document.createElement('h3');title.textContent=b.name;panel.appendChild(title);
    const detail=document.createElement('p');detail.textContent=`${b.address} · ${b.fill}% full · ${meters===null?'Location unavailable':meters.toFixed(1)+' m away'} · GPS ±${position?position.accuracy.toFixed(1):'—'} m`;panel.appendChild(detail);
    const status=document.createElement('p');status.textContent=arrived?'Within collection radius.':'Reach within 10 m with GPS accuracy of 10 m or better.';panel.appendChild(status);
    const route=document.createElement('button');route.className='worker-action-btn';route.textContent='Get Walking Directions';route.disabled=!position;route.onclick=()=>startRoute(b);panel.appendChild(route);
    const onWay=document.createElement('button');onWay.className='worker-action-btn';onWay.textContent='Mark on the way';onWay.onclick=async()=>{try{await api.setTaskStatus(selectedTask.id,'on-the-way');await refresh();}catch(e){alert(e.message);}};panel.appendChild(onWay);
    const collect=document.createElement('button');collect.className='worker-action-btn worker-secondary-btn';collect.textContent='Confirm Collection';collect.disabled=!arrived||busy;collect.onclick=complete;panel.appendChild(collect);
  }
  function startRoute(b){if(!position||!window.L.Routing)return alert('Routing service is unavailable.');clearRoute();routeControl=L.Routing.control({waypoints:[L.latLng(position.lat,position.lng),L.latLng(b.lat,b.lng)],routeWhileDragging:false,show:false,addWaypoints:false,draggableWaypoints:false,fitSelectedRoutes:true,lineOptions:{styles:[{color:'#16834a',weight:5,opacity:.8}]}}).addTo(map);}
  async function complete(){if(!selectedTask||!position||busy)return;const b=binFor(selectedTask.bin_id),meters=dist(position,b);if(meters>10||position.accuracy>10)return alert('You must be within 10 metres and GPS accuracy must be 10 metres or better.');if(!confirm(`Confirm collection at ${b.name}?`))return;busy=true;
    try{await api.completeTask(selectedTask.id,position);selectedTask=null;clearRoute();await refresh();message('Collection completed and recorded.');}
    catch(e){alert(e.message||'Could not complete collection.');}finally{busy=false;}
  }
  async function refresh(){const [newBins,newTasks,newHistory]=await Promise.all([api.getBins(),api.getMyTasks(),api.getHistory()]);bins=newBins;tasks=newTasks;history=newHistory;renderMap();renderStats();renderList();if(selectedTask&&myTasks().some(t=>t.id===selectedTask.id))renderSelected();else if(!myTasks().length){selectedTask=null;clearRoute();message('No active tasks. Ask your supervisor for an assignment.');}}
  function startGps(){if(!navigator.geolocation){message('This browser does not support GPS.');return;}watchId=navigator.geolocation.watchPosition(pos=>{const firstFix=!position;position={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};renderMap();if(firstFix&&map){
      const active=myTasks();
      const points=[[position.lat,position.lng],...active.map(t=>binFor(t.bin_id)).filter(Boolean).map(b=>[b.lat,b.lng])];
      if(points.length>1)map.fitBounds(L.latLngBounds(points),{padding:[45,45],maxZoom:15});
      else map.setView([position.lat,position.lng],15);
    }if(selectedTask)renderSelected();},err=>message('GPS error: '+err.message),{enableHighAccuracy:true,maximumAge:0,timeout:15000});}
  async function init(){
    if(map)return;
    try{
      if(!window.SmartWaste.mapMarkers)throw new Error('Map marker module did not load.');
      map=L.map('workerMap',{zoomControl:true}).setView([12.956,77.716],13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      await refresh();
      startGps();
      setTimeout(()=>map.invalidateSize(true),150);
    }catch(e){console.error(e);message('Could not load worker data: '+e.message);}
  }
  refreshBtn?.addEventListener('click',()=>refresh().catch(e=>alert(e.message)));
  window.addEventListener('beforeunload',()=>{if(watchId!==null)navigator.geolocation.clearWatch(watchId);});
  document.addEventListener('smartwaste:authorized', init, { once: true });
  if(window.SmartWaste?.currentProfile?.role==='worker')init();
})();
