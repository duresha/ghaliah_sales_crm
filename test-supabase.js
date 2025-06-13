// Test file for Supabase connection
import { supabase } from './lib/supabaseClient';

// Simple function to test connection and table structure
async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");
  
  try {
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase.rpc('get_service_status');
    
    if (healthError) {
      console.error("Supabase connection error:", healthError);
    } else {
      console.log("Connection successful:", healthCheck);
    }
    
    // Check for proposals table existence
    const { data: tableInfo, error: tableError } = await supabase
      .from('proposals')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error("Error accessing proposals table:", tableError);
    } else {
      console.log("Found proposals table with structure:", 
        tableInfo.length > 0 ? Object.keys(tableInfo[0]) : "No records found");
    }
    
    // Try to insert a test proposal
    const testProposal = {
      proposal_code: `TEST-${Math.floor(Math.random() * 1000)}`,
      // Leave out company_id to test if it's required
      service: 'Test Service',
      status: 'Draft',
      total_price: 1000
    };
    
    console.log("Testing insert with data:", testProposal);
    
    const { data: insertData, error: insertError } = await supabase
      .from('proposals')
      .insert(testProposal)
      .select();
      
    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      console.log("Insert successful:", insertData);
      
      // Clean up test data
      if (insertData && insertData[0] && insertData[0].id) {
        await supabase.from('proposals').delete().eq('id', insertData[0].id);
        console.log("Test data cleaned up");
      }
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Run the test when loading this file
testSupabaseConnection().then(() => {
  console.log("Test complete");
}).catch(err => {
  console.error("Test failed:", err);
}); 
