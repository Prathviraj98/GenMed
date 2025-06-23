import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch suggestions as user types
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const debounceTimer = setTimeout(() => {
      axios.get(`http://localhost:5000/api/medicines/suggestions?q=${searchTerm}`)
        .then(response => {
          setSuggestions(response.data);
        })
        .catch(error => {
          console.error('Error fetching suggestions:', error);
        });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/medicines/search?q=${searchTerm}`
      );
      setMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700">GenMed</h1>
        <p className="text-gray-600">
          Find Indian generic medicines
        </p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for a disease or medicine (e.g., Fever, Paracetamol)"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Search
        </button>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute w-full mt-1 bg-white shadow-lg rounded-lg z-10 max-h-60 overflow-y-auto">
            {suggestions.map((item, index) => (
              <li
                key={index}
                className="p-2 hover:bg-indigo-50 cursor-pointer"
                onClick={() => {
                  setSearchTerm(item.Disease);
                  setSuggestions([]);
                }}
              >
                {item.Disease} → <b>{item['Generic Name']}</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading medicines...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {medicines.map((med, index) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedMedicine(med)}
            >
              <h3 className="font-bold text-lg">{med['Generic Name']}</h3>
              <p className="text-gray-600">For: {med.Disease}</p>
              <p className="text-sm text-gray-500">
                {med['Group Name']} | MRP: ₹{med.MRP} | {med['Unit Size']}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Medicine Detail Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">
              {selectedMedicine['Generic Name']}
            </h2>
            <div className="mb-4">
              <p><span className="font-semibold">Disease:</span> {selectedMedicine.Disease}</p>
              <p><span className="font-semibold">Group:</span> {selectedMedicine['Group Name']}</p>
              <p><span className="font-semibold">Dosage:</span> {selectedMedicine['Unit Size']}</p>
              <p><span className="font-semibold">Price:</span> ₹{selectedMedicine.MRP}</p>
            </div>
            <button
              onClick={() => setSelectedMedicine(null)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
