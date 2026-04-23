import axios from "axios";

const URL = "http://localhost:3000/health";
let counter = 0;

async function callApi() {
  try {
    while (true) {
      const res = await axios.get(URL);
      counter++;
      console.log(counter, " Requests allowed:", res.status);
    }
  } catch (err: any) {
    if (err.response?.status === 429) {
      console.log("Rate limited. Retrying every second...");

      const interval = setInterval(async () => {
        try {
          let i = 0;
          while (i != 3) {
            const res = await axios.get(URL);
            console.log("Allowed again:", res.status);
            i++;
          }
          // clearInterval(interval); // stop retrying
        } catch (e) {
          console.log("Rate limited.");
        }
      }, 1000);
    }
  }
}

callApi();
