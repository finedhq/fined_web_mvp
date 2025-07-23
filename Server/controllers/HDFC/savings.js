import { supabase } from "../../supabaseClient.js";
import scrapeHDFCSavings from '../../scrappers/scrapeHDFC/savingshdfc.js';


export default async function fetchAndStoreHDFCSavings (req, res) {
  try {
    const productName = "HDFC Savings Account";
    const weekStart = new Date();
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());


    
    const { data: existing, error: fetchError } = await supabase
      .from('allSchemesData')
      .select('*')
      .eq('product_name', productName)
      .gte('created_at', weekStart.toISOString());

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to check existing data' });
    }

  
    if (existing && existing.length > 0) {
      console.log('Returning cached SBI FD data from this week.');
      return res.status(200).json(existing);
    }

    const product = await scrapeHDFCSavings();

    const { data, error } = await supabase
      .from('allSchemesData')
      .insert([product])
      .select();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: 'Insert failed' });
    }

    console.log('New SBI FD data scraped and stored.');
    res.status(200).json(data);
  } catch (err) {
    console.error('Scraping failed:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
