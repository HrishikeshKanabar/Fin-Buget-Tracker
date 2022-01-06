// create variable to hold db connection and establish connection to 'budget'
let db;
const request = indexedDB.open('budget', 1);

// For version change
request.onupgradeneeded = function (event) {

    const db = event.target.result;
    
    db.createObjectStore('new_transacion', { autoIncrement: true });
};

// on success

request.onsuccess = function (event) {
 
    db = event.target.result;
    if (navigator.onLine) {
        
      sendToWhenOnline();
    }
};

// on error

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new budget and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transacion'], 'readwrite');
    const transacionObjectStore = transaction.objectStore('new_transacion');
    transacionObjectStore.add(record);
}

// Send to server

function sendToWhenOnline() {
    const transaction = db.transaction(['new_transacion'], 'readwrite');
    const getAll = transacionObjectStore.getAll(); 
    
    // upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction/', {                                   
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
       
          const transaction = db.transaction(['new_transacion'], 'readwrite');
          const transacionObjectStore = transaction.objectStore('new_transacion');
          transacionObjectStore.clear();

          alert('FULL BUGDET HAS BEEN UPDATED!!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}


 // listen when coming back online
 window.addEventListener('online', sendToWhenOnline);