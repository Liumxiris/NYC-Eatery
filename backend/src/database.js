import axios from "axios";
import {getDatabase} from "./app.js"
import {doc, collection, addDoc, setDoc, getDoc, getDocs, updateDoc, query, where, arrayUnion, arrayRemove} from "firebase/firestore"; 
import { async } from "@firebase/util";
const BASE_URL = "https://maps.googleapis.com/maps/api/place"
const PHOTO_HEIGHT = 400
const PHOTO_WIDTH = 240

export const fetchRestaurant  = (placeID) => {
    const detailUrl = `${BASE_URL}/details/json?place_id=${placeID}&key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}`
    axios.get(detailUrl).then(response=>{
      const placeData = response.data.result;
      let placeDetail = {
        id: placeID,
        name : placeData.name === null ? "" : placeData.name,
        rating : placeData.rating === null ? 0 : placeData.rating, 
        img: ""
      }
      fetchPhoto(placeData.photos, placeDetail)
    }).catch(error => {
      console.log('err in fetch place detail', error)
    })
}

const fetchPhoto = async(photos, placeDetail) => {
  if (photos != null) {
    const photoID = photos[0].photo_reference
    const getPhotoUrl = `${BASE_URL}/photo?maxheight=${PHOTO_HEIGHT}&maxwidth=${PHOTO_WIDTH}&photo_reference=${photoID}&key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}`
    axios.get(getPhotoUrl, {responseType: 'arraybuffer'} ).then(response=>{
      const imageString = Buffer.from(response.data, 'binary').toString('base64');
      placeDetail.img = imageString
      // console.log(placeDetail.name, placeDetail.rating, placeDetail.img)
      //add fetched restaurant to firestore
      const savedId = saveRestaurant(placeDetail)
    }).catch(error => {
      console.log('err in fetch place photo', error)
      return null
    })
  } 
}

const saveRestaurant = async (restaurant) => {
  const firestoreDB = getDatabase()
  try {
    const docRef = await addDoc(collection(firestoreDB, "restaurants"), {
      id: restaurant.id,
      name: restaurant.name,
      rating: restaurant.rating,
      img: restaurant.img
    });
    console.log("restaurant document written with ID: ", docRef.id);
    return docRef.id
  } catch (e) {
    console.error("Error adding restaurant document: ", e);
  }
}

export const saveUser = async (githubdata) => {
  const firestoreDB = getDatabase()
  const querySnapshot = await getDocs(collection(firestoreDB, "users"));
  let exist = false
  querySnapshot.forEach((doc) => {
    if (doc.data().id === githubdata.id){
      console.log("user exists")
      exist = true
      return
    }
  });
  //if user does not exist, create a new document
  if (!exist){
    try {
      const docRef =  await addDoc(collection(firestoreDB, "users"), {
        id: githubdata.id,
        username: githubdata.login,
        savedRestaurants: []
      });
      console.log("user document written with ID: ", docRef.id);
      return docRef.id
    } catch (e) {
      console.error("Error adding user document: ", e);
    }
  }
}

export const getRestaurantByName = async (restaurantName) => {
  const db = getDatabase()
  try {
    const q = query(collection(db, "restaurants"), where("name", "==", restaurantName));
    const querySnapshot = await getDocs(q);
    // const restId = [];
    // querySnapshot.forEach((doc) => {
    //   console.log(doc.data().id)
    //   restId.push(doc.data().id)
    // });
    // return restId[0];
    const restInfo = []
    querySnapshot.forEach((doc) => {
      const info = {
        name: doc.data().name,
        id: doc.data().id,
        rating: doc.data().rating,
        img: doc.data().img
      };
      restInfo.push(info)
    });
    return restInfo[0];
  } catch (e) {
    console.log("error in GetRestByName")
    return null
  }
}

export const getSavedRestaurants = async (userID) => {
  const db = getDatabase()
  try {
    const q = query(collection(db, "users"), where("id", "==", userID));
    const querySnapshot = await getDocs(q);
    const savedRests = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.data().savedRestaurants)
      savedRests.push(doc.data().savedRestaurants)
    });
    return savedRests[0];
  } catch (e) {
    console.log("error in GetSavedRestaurants")
    return null
  }
}

export const addSavedRestaurant = async (userID, restaurantID) => {
  const db = getDatabase()
  try {
    const q = query(collection(db, "users"), where("id", "==", userID));
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(async (d) => {
      const docRef = doc(db, "users", d.id);
      await updateDoc(docRef, {
        savedRestaurants: arrayUnion(restaurantID)
      });
      const updatedDoc = await getDoc(docRef);
      return updatedDoc.data().savedRestaurants;
    });
    const updatedSavedRestaurants = await Promise.all(updatePromises);
    return updatedSavedRestaurants[0];
  } catch (e) {
    console.log("error in addSavedRestaurants")
    return null
  }
}

export const deleteSavedRestaurant = async (userID, restaurantID) => {
  const db = getDatabase()
  try {
    const q = query(collection(db, "users"), where("id", "==", userID));
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(async (d) => {
      const docRef = doc(db, "users", d.id);
      await updateDoc(docRef, {
        savedRestaurants: arrayRemove(restaurantID)
      });
      const updatedDoc = await getDoc(docRef);
      return updatedDoc.data().savedRestaurants;
    });
    const updatedSavedRestaurants = await Promise.all(updatePromises);
    return updatedSavedRestaurants[0];
  } catch (e) {
    console.log("error in deleteSavedRestaurants")
    return null
  }
}

export const getRestaurantInfo = async (restaurantID) => {
  const db = getDatabase()
  try {
    const q = query(collection(db, "restaurants"), where("id", "==", restaurantID));
    const querySnapshot = await getDocs(q);
    const restInfo = []
    querySnapshot.forEach((doc) => {
      const info = {
        name: doc.data().name,
        id: doc.data().id,
        rating: doc.data().rating,
        img: doc.data().img
      };
      restInfo.push(info)
    });
    return restInfo[0];
  } catch (e) {
    console.log("Error in fetching restaurant info")
    return null
  }
}

export const getComments = async (restaurantID) => {
  const db = getDatabase()
  const q = query(collection(db, "comments"), where("restaurantID", "==", restaurantID));
  try {
    let comments = []
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return comments
    }
    querySnapshot.forEach((doc) => {
      const comment = {
        content: doc.data().content,
        restaurantID : doc.data().restaurantID,
        time: doc.data().time,
        user: doc.data().user
      }
      comments.push(comment)
    })
    console.log("got comments", comments)
    return comments
  } catch (e) {
    console.log("error in GetComments")
    return null
  }
}


export const postComment = async (restaurantID, userName, comment) => {
  const db = getDatabase()
  console.log("comment:", comment)
  const {content, time} = comment
  try {
    const docRef = await addDoc(collection(db, "comments"), {
      restaurantID: restaurantID,
      user: userName,
      content,
      time
    });
    console.log("comment document written with ID: ", docRef.id);
    return docRef.id
  } catch (e) {
    console.error("Error adding restaurant document: ", e);
    return null;
  }
}

export const getAllRestaurants = async () => {
  const db = getDatabase()
  const restsInfo = []
  try {
    const querySnapshot = await getDocs(collection(db, "restaurants"));
    querySnapshot.forEach((doc) => {
      const restInfo = {
        id: doc.data().id,
        img: doc.data().img,
        name: doc.data().name,
        rating: doc.data().rating
      }
      restsInfo.push(restInfo)
    });
    return restsInfo
  } catch (e) {
    console.error("Error fetching restaurants info")
    return null
  }
}