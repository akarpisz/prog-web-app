let db;

const dbReq = window.indexedDB.open("budgetList", 1);

dbReq.onupgradeneeded = ({ target }) => {
  db = target.result;
  const objStore = db.createObjectStore("pending", { autoIncrement: true });
  objStore.createIndex("pending", "pending");
};

dbReq.onsuccess = (event) => {
  db = event.target.result;

  console.log(event.target.result);
  if (navigator.onLine) {
    checkDatabase();
  }
};

dbReq.onerror = (err) => {
  alert(err);
};

const checkDatabase = () => {
  console.log("Checking");
  const tx = db.transaction(["pending"], "readwrite");
  const objStore = tx.objectStore("pending");
  const getAll = objStore.getAll();

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      console.log("getAll Success");
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
      })
      .then((res)=>{res.json()})
      .then(()=>{
          const tx = db.transaction(["pending"],"readwrite");
          const objStore = tx.objectStore("pending");
          objStore.clear();
      })
    }
  };
}

const addItem = (data) => {
  console.log(data);
  const tx = db.transaction(["pending"], "readwrite");
  const objStore = tx.objectStore("pending");
  objStore.add(data);
}

window.addEventListener("online", checkDatabase);