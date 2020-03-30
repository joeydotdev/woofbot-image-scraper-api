import Instagram from "./scraper/instagram";

const instagram = new Instagram();
instagram.fetchUserMedia('lychee_the_corgi', 1000)
  .then((res) => {
    console.log(res.length + " pictures");
  })
  .catch((err) => console.log(err));