// Shared database API. All operational writes are validated by Supabase RPCs/RLS.
window.SmartWaste = window.SmartWaste || {};
window.SmartWaste.data = (() => {
  const db = window.smartWasteSupabase;
  const toBin = b => ({ id:b.id, name:b.name, address:b.address, lat:Number(b.lat), lng:Number(b.lng), fill:Number(b.fill), status:b.status, updatedAt:new Date(b.updated_at).getTime() });
  async function getBins() {
    const { data, error } = await db.from('public_bins').select('id,name,address,lat,lng,fill,status,updated_at').order('id');
    if (error) throw error; return data.map(toBin);
  }
  async function getMyTasks() {
    const { data, error } = await db.from('assignments').select('*').eq('worker_id', window.SmartWaste.currentUser.id).neq('status','collected').neq('status','cancelled').order('assigned_at');
    if (error) throw error; return data;
  }
  async function getAssignments() {
    const { data, error } = await db.from('assignments').select('*').order('assigned_at',{ascending:false});
    if (error) throw error; return data;
  }
  async function getWorkers() {
    const { data, error } = await db.from('profiles').select('id,email,full_name,role').eq('role','worker').order('email');
    if (error) throw error; return data;
  }
  async function getHistory() {
    const { data, error } = await db.from('collection_history').select('*').order('completed_at',{ascending:false}).limit(100);
    if (error) throw error; return data;
  }
  async function inviteWorker(email, fullName) {
    const { data, error } = await db.rpc('invite_worker',{p_email:email,p_full_name:fullName || null});
    if (error) throw error; return data;
  }
  async function assignTask(binId, workerId) {
    const { data, error } = await db.rpc('assign_collection_task',{p_bin_id:Number(binId),p_worker_id:workerId});
    if (error) throw error; return data;
  }
  async function setTaskStatus(taskId,status) {
    const { data,error } = await db.rpc('set_worker_task_status',{p_task_id:taskId,p_status:status});
    if (error) throw error; return data;
  }
  async function completeTask(taskId,location) {
    const { data,error } = await db.rpc('complete_collection',{
      p_task_id:taskId,p_worker_lat:location.lat,p_worker_lng:location.lng,p_gps_accuracy_m:location.accuracy
    });
    if (error) throw error; return data;
  }
  async function setBinStatus(binId,status) {
    const { data,error } = await db.rpc('supervisor_set_bin_status',{p_bin_id:Number(binId),p_status:status});
    if (error) throw error; return data;
  }
  return { getBins,getMyTasks,getAssignments,getWorkers,getHistory,inviteWorker,assignTask,setTaskStatus,completeTask,setBinStatus };
})();
