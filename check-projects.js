require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProjects() {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) {
    console.error('Error fetching projects:', error);
  } else {
    console.log('Projects in DB:', JSON.stringify(data, null, 2));
  }
}

checkProjects();
