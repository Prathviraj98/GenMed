const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvFilePath = path.join(__dirname, '../data/genmed.csv');

const loadMedicines = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

const searchMedicines = async (req, res) => {
  try {
    const query = req.query.q.toLowerCase();
    const allMedicines = await loadMedicines();
    
    const results = allMedicines.filter(medicine => {
      return (
        medicine.Disease.toLowerCase().includes(query) ||
        medicine['Generic Name'].toLowerCase().includes(query) ||
        medicine['Group Name'].toLowerCase().includes(query)
      );
    });

    res.json(results);
  } catch (err) {
    console.error('Error searching medicines:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const query = req.query.q.toLowerCase();
    const allMedicines = await loadMedicines();
    
    const diseaseMatches = allMedicines.filter(medicine => 
      medicine.Disease.toLowerCase().includes(query)
    ).slice(0, 5);

    res.json(diseaseMatches);
  } catch (err) {
    console.error('Error getting suggestions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  searchMedicines,
  getSuggestions
};
