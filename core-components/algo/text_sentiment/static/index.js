// // index.js

// // Function to make the API call and set iframe sources
// function fetchVoyantData(corpus) {
//     const port = 8888; // You can pass this dynamically if needed

//     // const data = {
//     //     inputFormat: 'text',
//     //     input: text
//     // };

//     // fetch(`http://localhost:${port}`, {
//     //     method: 'POST',
//     //     body: new URLSearchParams(data),
//     //     headers: {
//     //         'Content-Type': 'application/x-www-form-urlencoded',
//     //     }
//     // })

//     .then(response => response.json())
//     .then(responseData => {
//         // Assuming the response contains the corpus ID
//         const corpus = responseData.corpus;

//         // Set iframe URLs dynamically
//         document.getElementById('cirrus-frame').src = `http://localhost:${port}/tool/Cirrus/?corpus=${corpus}`;
//         document.getElementById('trends-frame').src = `http://localhost:${port}/tool/Trends/?corpus=${corpus}`;
//         document.getElementById('summary-frame').src = `http://localhost:${port}/tool/Summary/?corpus=${corpus}`;
//         document.getElementById('collocates-frame').src = `http://localhost:${port}/tool/CorpusCollocates/?corpus=${corpus}`;
//     })
//     .catch(error => {
//         console.error('Error fetching Voyant data:', error);
//     });
// }
