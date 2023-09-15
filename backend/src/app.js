import express, { response } from "express"
import * as restaurantsDB from "./database.js"
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { config } from 'dotenv';
import {doc, collection, addDoc, setDoc, getDocs} from "firebase/firestore"; 
import fs from 'fs';
import path from 'path';
import cors from 'cors'
import axios from "axios";
config();

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(
    cookieSession({
      secret: "cookiesecret",
      signed: false,
      name: '__session'
    })
  );
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(cors())

const client_id = process.env.OAUTH_CLIENT
const client_secret = process.env.OAUTH_SECRET
const firebaseConfig = {
    apiKey: "AIzaSyCZw863e1HWfaIAHbC5RozNRfUK6HSe0Xc",
    authDomain: "chillysquirrels-milestone3.firebaseapp.com",
    projectId: "chillysquirrels-milestone3",
    storageBucket: "chillysquirrels-milestone3.appspot.com",
    messagingSenderId: "559811630176",
    appId: "1:559811630176:web:8d8c0f639d63aa27029f05",
    measurementId: "G-TCYX9QDQGK"
  };
  
// Initialize Firebase
const fireBaseApp = initializeApp(firebaseConfig);
const firestoreDB = getFirestore(fireBaseApp);

const populateRestaurants = async () => {
    //populate the restaurant database only when first time initialize the app
    const querySnapshot = await getDocs(collection(firestoreDB, "restaurants"));
    if (querySnapshot.empty) {
        fs.readFile('./src/restaurantsID.txt', 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            let listId = data.split("\n")
            listId.forEach(id => {
                console.log("now parsing" +id)
                restaurantsDB.fetchRestaurant(id)
            })
        });
    } else {
        console.log("Database filled")
        return
    }
}

export const getDatabase = () => {
    return firestoreDB
}

app.get('/', (request, response) => {
  populateRestaurants()
  response.redirect("https://chillysquirrels-milestone3.firebaseapp.com")
})


//handle user authorization
app.get('/api/login/github', (request,response) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}`
  console.log('redirected',url)
  response.status(200).send({redirected: url})
  //response.redirect(url)
})

/** 
 * Return:
 *  200 OK - successful login
 *  401 Unauthorized - SSO login failed
*/
app.get('/api/login/github/callback', async (request,response) => {
    console.log('GET: ',request.url)
    const code = request.query.code
    const token = await getAccessToken(code)
    const githubdata = await getGithubUser(token)
    //check if user is authorized
    if(githubdata){
        request.session.githubId = githubdata.id
        request.session.token = token
        request.session.githubName = githubdata.login
        //save the user to the database if loggedin first time
        restaurantsDB.saveUser(githubdata)
        response.status(200)
        response.redirect('/')
    }else{
      response.status(401).send("Error: not authorized")
    }
})

async function getAccessToken(code){
    const token_url = 'https://github.com/login/oauth/access_token'
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const requestBody = {
      client_id,
      client_secret,
      code
    };
    try {
      const response = await axios.post(token_url, requestBody, config);
      const data = response.data;
      const params = new URLSearchParams(data);
      const access_token = params.get('access_token');
      return access_token;
    } catch (error) {
      console.error(error);
    }
    // const res = await fetch(token_url,{
    //     method: 'POST',
    //     headers:{
    //         'Content-Type':'application/json'
    //     },
    //     body: JSON.stringify({
    //         client_id,
    //         client_secret,
    //         code
    //     })
    // })
}
  
async function getGithubUser(access_token){
  const config = {
    headers: {
      Authorization: `bearer ${access_token}`
    }
  };
  try {
    const response = await axios.get('https://api.github.com/user', config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
    // const req = await fetch('https://api.github.com/user',{
    //     headers:{
    //         Authorization: `bearer ${access_token}`
    //     }
    // })
    // const data = await req.json()
    // return data
}
/** 
 * Return:
 *  200 OK - successful logout
*/
app.post('/api/logout',(request,response) =>{
    request.session = null
    response.clearCookie()
    response.redirect('/')
})

/** 
 * Get the id of the current user
 * Return:
 *  200 OK - with the {githubId} of logged user
 *  401 Unauthorized - no user logged in 
*/
app.get('/api/user',(request,response) => {
  console.log(request.session)
    if(request.session.githubId){
        console.log("sent githubId:" + request.session.githubId)
        response.status(200).send({githubId: request.session.githubId, githubName:request.session.githubName})
    }else{
        console.log("user is not authorized")
        response.status(401).send("User is not authorzied")
    }
})

/** 
 * Get the searched restaurant id
 * Return:
 *  200 OK - with the {restaurantId}
 *  404 Not Found - no matching restaurant
*/
app.get('/api/search/:restaurantName',(request,response) => {
  const { restaurantName } = request.params
  const restaurantID = restaurantsDB.getRestaurantByName(restaurantName).then(result => {
    if (result) {
      response.status(200).send(result)
    } else {
      response.status(404).send("restaurant not found")
    }
  })
});

/** 
 * Get all restaurants and their rating
 * Return:
 *  200 OK - dict of restaurant and rating
 *  401 Unauthorized - no user logged in
*/
app.get('/api/allrestaurants', (request, response) => {
  const restsInfo = restaurantsDB.getAllRestaurants().then(result => {
    if (result) {
      response.status(200).send(result)
    } else {
      response.status(404).send("No restaurants")
    }
  })
})


/** 
 * Get saved restaurants
 * Return:
 *  200 OK - with the restaurant list
 *  401 Unauthorized - no user logged in
*/
app.get('/api/saved', async (request,response) => {
  const userid = request.session.githubId
  if (userid) {
    // const savedRestaurantIds = restaurantsDB.getSavedRestaurants(userid).then(result => {
    //   if (result) {
    //     response.status(200).send(result)
    //   } else {
    //     response.status(401).send("no user info")
    //   }
    // })
    try {
      const savedRestaurantIds = await restaurantsDB.getSavedRestaurants(userid);
      const restaurantInfoPromises = savedRestaurantIds.map(restaurantID => {
        return restaurantsDB.getRestaurantInfo(restaurantID);
      });
      const restaurantInfo = await Promise.all(restaurantInfoPromises);
      response.status(200).send(restaurantInfo);
    } catch (error) {
      console.error(error);
      response.status(500).send("Error retrieving saved restaurants");
    }
  } else {
    response.status(401).send("no user logged in")
  }
});

/** 
 * Add new restaurant to saved restaurants
 * Return:
 *  200 OK - with the restaurant list
 *  401 Unauthorized - no user logged in
*/
app.post('/api/saved/:restaurantID',(request,response) => {
  const userid = request.session.githubId
  console.log("uid", userid)
  const { restaurantID } = request.params
  console.log("rid", restaurantID)
  if (userid) {
    const savedRestaurants = restaurantsDB.addSavedRestaurant(userid, restaurantID).then(result => {
      if (result) {
        response.status(201).send(restaurantID)
      } else {
        response.status(401).send("no restaurant info")
      }
    })
  } else {
    response.status(401).send("no user logged in")
  }
});

/** 
 * Delete a specific restaurant from the saved list
 * Return:
 *  200 OK - with the updated restaurant list
 *  401 Unauthorized - no user logged in
*/
app.delete('/api/saved/:restaurantID',(request,response) => {
  const userid = request.session.githubId
  const { restaurantID } = request.params
  if (userid) {
    const savedRestaurants = restaurantsDB.deleteSavedRestaurant(userid, restaurantID).then(result => {
      if (result) {
        response.status(201).send(restaurantID)
      } else {
        response.status(401).send("no restaurant info")
      }
    })
  } else {
    response.status(401).send("no user logged in")
  }
});

/** 
 * Get info of a specific restaurant
 * Return:
 *  200 OK - with the restaurant info
 *  404 Not Found - no such restaurant
*/
app.get('/api/restaurant/:restaurantID',(request,response) => {
  const { restaurantID } = request.params
  console.log("called get")
  const restaurantInfo = restaurantsDB.getRestaurantInfo(restaurantID).then(result => {
    if (result) {
      response.status(200).send(result)
    } else {
      response.status(404).send("no such restaurant")
    }
  })
});

/** 
 * Get comments of a specific restaurant
 * Return:
 *  200 OK - with the comments info
 *  404 Not Found - no such restaurant
*/
app.get('/api/comments/:restaurantID',(request,response) => {
  const { restaurantID } = request.params
  const comments = restaurantsDB.getComments(restaurantID).then(result => {
    if (result) {
      console.log("result", result)
      response.status(200).send(result)
    } else {
      response.status(404).send("no such restaurant")
    }
  })
});

/** 
 * Post comment for a specific restaurant
 * Return:
 *  200 OK
 *  401 Unauthorized - no user logged in
*/
app.post('/api/comments/:restaurantID',(request,response) => {
  const userid = request.session.githubId
  const userName = request.session.githubName
  const { restaurantID } = request.params
  if (userid) {
    console.log("request body", request.body)
    const newComment = restaurantsDB.postComment(restaurantID, userName, request.body).then(result => {
      if (result) {
        response.status(201).send("comments created")
      } else {
        response.status(401).send("no restaurant info")
      }
    })
  } else {
    response.status(401).send("no user logged in")
  }
});

export default app;

