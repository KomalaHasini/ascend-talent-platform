// All talking to the shared database (Supabase) happens in this file.
import { supabase } from './supabase';

// turns a database row into the shape the components use
function rowToTalent(row) {
  return {
    id: row.id,
    authorId: row.author_id,
    author: row.author,
    category: row.category,
    title: row.title,
    desc: row.description,
    image: row.media_url,
    mediaType: row.media_type,
    endorsements: row.endorsements || 0,
    timestamp: new Date(row.created_at).getTime(),
  };
}

async function callFunction(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  if (data && data.error) throw new Error(data.error);
  return data;
}

// ----- accounts -----
export async function signUp(contact, password) {
  return callFunction('signup_user', { p_contact: contact, p_password: password });
}

export async function logIn(contact, password) {
  return callFunction('login_user', { p_contact: contact, p_password: password });
}

export async function fetchUsernames() {
  const { data, error } = await supabase.rpc('list_usernames');
  if (error) throw new Error(error.message);
  return data || [];
}

// ----- talents -----
export async function fetchTalents() {
  const { data, error } = await supabase
    .from('talents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(rowToTalent);
}

export async function addTalent({ user, category, title, desc, file, mediaType }) {
  let mediaUrl = null;

  if (file) {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);
    mediaUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabase
    .from('talents')
    .insert({
      author_id: user.id,
      author: user.username,
      category,
      title,
      description: desc,
      media_url: mediaUrl,
      media_type: file ? mediaType : null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToTalent(data);
}

export async function endorse(talentId) {
  const { error } = await supabase.rpc('endorse_talent', { talent_id: talentId });
  if (error) throw new Error(error.message);
}

// ----- opportunities -----
function rowToOpportunity(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.opp_type,
    organiser: row.organiser,
    location: row.location,
    description: row.description,
    minTier: row.min_tier,
    deadline: row.deadline, // 'YYYY-MM-DD'
    link: row.apply_link,
  };
}

export async function fetchOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('deadline', { ascending: true });
  if (error) throw new Error(error.message);
  return data.map(rowToOpportunity);
}

// ids of the opportunities this user already applied to
export async function fetchMyApplications(userId) {
  const { data, error } = await supabase.rpc('my_applications', { p_user: userId });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function applyToOpportunity(userId, opportunityId) {
  return callFunction('apply_to_opportunity', { p_user: userId, p_opportunity: opportunityId });
}
