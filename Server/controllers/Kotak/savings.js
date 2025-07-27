import { supabase } from "../../supabaseClient.js";
import scrapeKotak811Account from '../../scrappers/scrapeKotak/savings.js';

export default async function fetchAndStoreKotakProduct (req, res) {
  try {
    const productName = "Kotak 811 Digital Savings Account";
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday start

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
      return res.status(200).json(existing);
    }

    const product = await scrapeKotak811Account();
    const { data, error } = await supabase
      .from('allSchemesData')
      .insert([product])
      .select();

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).json({ error: 'Insert failed' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Scraping failed:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
