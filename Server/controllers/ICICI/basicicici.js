import { supabase } from "../../supabaseClient.js";
import scrapeBasicICICISavings from '../../scrappers/scrapeICICI/icicibasic.js';


export default async function fetchAndStoreBasicICICISavings (req, res) {
  try {
    const productName = "ICICI Basic Savings Account";
    const weekStart = new Date();
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());


    
    const { data: existing, error: fetchError } = await supabase
      .from('allSchemesData')
      .select('*')
      .eq('product_name', productName)
      .gte('created_at', weekStart.toISOString());

    if (fetchError) {
      return res.status(500).json({ error: 'Failed to check existing data' });
    }

  
    if (existing && existing.length > 0) {
      return res.status(200).json(existing);
    }

    const product = await scrapeBasicICICISavings();

    const { data, error } = await supabase
      .from('allSchemesData')
      .insert([product])
      .select();

    if (error) {
      return res.status(500).json({ error: 'Insert failed' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Scraping failed:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
