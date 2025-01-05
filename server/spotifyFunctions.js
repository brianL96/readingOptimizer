    

async function appendAudioBookDuration(token, list){

    let arr = [];
    let i = 0;
    let length = list.length;
  
    while(i < length){
      //let duration = await getSpotifyAudioBookIDWait(token, list[i].author, list[i].title);
      let wait = await getWait(1000);
      let duration = await getSpotifyAudioBookID(token, list[i].author, list[i].title);
      arr.push(duration);
      i++;
    }
  
    return arr;
}
  
  
async function getSpotifyAccessToken(){
  
    let clientID = process.env.SPOTIFY_CLIENT_ID || '';
    let clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  
    let request = new Request('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(clientID + ":" + clientSecret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
  
    try{
      let response = await fetch(request);
      if(!response.ok){
        throw new Error(`${response.status}`);
      }
      let data = await response.json();
      console.log("Here is the Spotify Access Token:");
      console.log(data);
    }
    catch(error){
      console.log("Problem Fetching Spotify API");
      console.log(error);
    }
  
  
}
  
async function getSpotifyAudioBookID(token, author, title){
  
    let request = new Request(`https://api.spotify.com/v1/search?q=${author.replaceAll(' ', '%2520')}%2520${title.replaceAll(' ', '%2520')}&type=audiobook`, {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token},
    });
  
    try{
        let response = await fetch(request);
        if(!response.ok){
          throw new Error(`${response.status}`);
        }
        let data = await response.json();
        console.log("Here is the Spotify response:");
        let id = data.audiobooks.items[0].id
        console.log(id);
        console.log("Now want Book Length:");
        //let audiobookLength = await getAudioBookLengthWait(token, id);
        let wait = await getWait(1000);
        let audiobookLength = await getAudioBookLength(token, id);
        console.log("Final Value:");
        console.log(audiobookLength);
        return audiobookLength;
  
      }
      catch(error){
        console.log("Problem Fetching Spotify API");
        console.log(error);
      }
  
}
    
    
async function getAudioBookLength(token, audiobookID){
  
    let request = new Request(`https://api.spotify.com/v1/audiobooks/${audiobookID}`, {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token},
    });
  
    try{
        let response = await fetch(request);
        if(!response.ok){
            throw new Error(`${response.status}`);
        }

        let data = await response.json();
        console.log("Here is the Spotify response:");
        let i = 0;
        let totalChapters = data.total_chapters;
        console.log(`Here are the total amount of chapters: ${totalChapters}`);
        let length = data.chapters.items.length;
        let totalMilli = 0;
        while(i < length){
            totalMilli = totalMilli + data.chapters.items[i].duration_ms;
            i++;
        }
  
        console.log(`Milliseconds in first set of chapters: ${totalMilli}`);
  
        let offset = length;
        let restTotalMilli = 0;
  
        while(offset < totalChapters){
            console.log(`Request from ${offset} to ${offset + 50}`);
            //let value = await getAudioBookChaptersWait(token, audiobookID, offset);
            let wait = await getWait(1000);
            let value = await getAudioBookChapters(token, audiobookID, offset);
            restTotalMilli = restTotalMilli + value;
            offset = offset + 50;
        }
  
        totalMilli = totalMilli + restTotalMilli;
  
        console.log(`The total amount of milliseconds in this audiobook is: ${totalMilli}`);
        return totalMilli;
    }
    catch(error){
        console.log("Problem Fetching Spotify API");
        console.log(error);
    }
  
}


async function getAudioBookChapters(token, audiobookID, offset){

    let request = new Request(`https://api.spotify.com/v1/audiobooks/${audiobookID}/chapters?limit=50&offset=${offset}`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + token},
    });
  
    try{
      let response = await fetch(request);
      if(!response.ok){
        throw new Error(`${response.status}`);
      }
      let data = await response.json();
      console.log("Here is the Spotify response:");
      let length = data.items.length;
      let i = 0;
      let totalMilli = 0;
  
      while(i < length){
        totalMilli = totalMilli + data.items[i].duration_ms;
        i++;
      }
  
      console.log(`I considered here : ${i} chapters`);
  
      console.log(totalMilli);
  
      return totalMilli;
      
  
    }
    catch(error){
      console.log("Problem Fetching Spotify API");
      console.log(error);
    }
  
}

function getWait(time){

  let promise = new Promise((resolve, reject) => {

    if(time === 0){
      resolve(true);
    }
    else{
      console.log(`Need to wait: ${time}`);
    }

    setTimeout( async () => {
      resolve(true);
    }, time);

  });

  return promise;

}

module.exports = {
    getSpotifyAccessToken,
    appendAudioBookDuration
}