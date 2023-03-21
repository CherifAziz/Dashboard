const { google } = require("googleapis");
const fetch = require("node-fetch");
const cors = require("cors");
const Router = require("express").Router;
const router = Router();
const youtube = google.youtube("v3");
const gmail = google.gmail("v1");
require("dotenv").config();
const axios = require("axios");
const admin = require("firebase-admin");

var serviceAccount = require("../admin.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dashboard-e98c4-default-rtdb.firebaseio.com",
  storageBucket: "dashboard-e98c4.appspot.com",
  authDomain: "dashboard-e98c4.firebaseapp.com",
});

var db = admin.firestore();

var accessToken = "";
var refreshToken = "";
var tentative_refresh = 2;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:8080/google/handleGoogleRedirect"
);

router.get("/auth", cors(), (req, res) => {
  const data = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://mail.google.com/",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
    prompt: "consent",
    state: "token=" + req.query.token,
  });
  res.redirect(data);
});

const send_accessToken = (user_uid) => {
  const userDocRef = db.collection("Users").doc(user_uid);
  const servicesColRef = userDocRef.collection("Services");
  console.log(accessToken);
  const tokens = {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
  servicesColRef
    .doc("Google")
    .set(tokens, { merge: true })
    .then(() => {
      console.log("Tokens added to Firestore");
      return 200;
    })
    .catch((error) => {
      console.log("Error adding tokens to Firestore", error);
      return 1;
    });
};

router.get("/handleGoogleRedirect", async (req, res) => {
  const code = req.query.code;
  const user_id = req.query.state.split(",")[0].split("=")[1];
  console.log("server 36 | code", code);
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.log("server 39 | error", err);
      throw new Error("Issue with Login", err.message);
    }
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const response = send_accessToken(user_id);
    if (response != 200) console.log("error");
    res.redirect("http://localhost:3000/home");
  });
});

const getValidToken = async (refreshToken) => {
  try {
    const request = await fetch("https://www.googleapis.com/oauth2/v4/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await request.json();
    return { status: "success", content: data.access_token };
  } catch (error) {
    console.log(error);
    return { status: "error", content: error };
  }
};

const GetMailInfo = async (acces, user_mail, max) => {
  oauth2Client.setCredentials({ access_token: acces });
  const res = await gmail.users.messages.list({
    auth: oauth2Client,
    userId: user_mail,
    maxResults: max,
  });
  if (!res.data.messages) return false;
  return res.data.messages || [];
};

const Getmail = async (access, refresh, userUid) => {
  const { data } = await axios
    .get("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + access)
    .catch(async (error) => {
      if (error.response.status == 401 && tentative_refresh > 0) {
        console.log("aa");
        tentative_refresh--;
        const response = await getValidToken(refresh);
        if (response.status === "error") {
          console.log("bb");
          return { status: "error" };
        } else {
          console.log(response.content);
          accessToken = response.content;
          const userRef = admin.firestore().collection("Users").doc(userUid);
          const googleDocRef = userRef.collection("Services").doc("Google");
          if (response.content) {
            console.log("putaiiiin");
            await googleDocRef.update({
              accessToken: response.content,
            });
            access = response.content;
            console.log(
              "Tokens de Google mis à jour avec succès dans la base de données."
            );
          } else {
            console.error("Access token undefined.");
          }
        }
        access = response.content;
        return await Getmail(response.content, refresh, userUid);
      }
      if (error.response.status == 401 && tentative_refresh == 0) {
        console.log("token expired please reconnect");
        return { status: "error" };
      }
      console.log("dd");
      tentative_refresh = 2;
      return { status: "error" };
    });
  console.log(data);
  if (data == undefined) return await Getmail(access, refresh, userUid);
  return { mail: data.email, accesToken: access };
};

const getUserTokens = async (user_uid) => {
  try {
    const userRef = admin.firestore().collection("Users").doc(user_uid);
    const googleDocRef = userRef.collection("Services").doc("Google");
    const doc = await googleDocRef.get();
    if (doc.exists) {
      const data = doc.data();
      return { access: data.accessToken, refresh: data.refreshToken };
    } else {
      console.log("Le document n'existe pas!");
      return null;
    }
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des tokens de l'utilisateur ${user_uid} :`,
      error
    );
    return null;
  }
};

router.get("/ListEmails", async (req, res) => {
  const tokens = await getUserTokens(req.query.uid);
  accessToken = tokens?.access;
  refreshToken = tokens?.refresh;
  console.log(accessToken);
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  const data = await Getmail(accessToken, refreshToken, req.query.uid);
  const user_mail = data.mail;
  // token[0] = data.accesToken;
  oauth2Client.setCredentials({
    access_token: data.accesToken,
    refresh_token: refreshToken,
  });
  var mail = await GetMailInfo(data.accesToken, user_mail, req.query.max);
  const messageIds = mail.map((message) => message.id);
  const messagesDetails = [];
  for (let i = 0; i < messageIds.length; i++) {
    const message = await gmail.users.messages.get({
      auth: oauth2Client,
      userId: "me",
      id: messageIds[i],
      format: "full",
      q: "to:me",
    });
    const fromHeader = message?.data.payload?.headers.find(
      (header) => header.name === "From"
    );
    const toHeader = message?.data.payload?.headers.find(
      (header) => header.name === "To"
    );
    const subjectHeader = message?.data.payload?.headers.find(
      (header) => header.name === "Subject"
    );
    const content = message.data.payload.parts[0]?.body?.data
      ? Buffer.from(
          message.data.payload.parts[0].body.data,
          "base64"
        ).toString()
      : "";
    const receivedHeader = message.data.payload.headers.find(
      (header) => header.name === "Date"
    );
    let _date = "";
    let date = "";
    const now = new Date();

    if (receivedHeader) {
      const dateString = receivedHeader.value;
      date = new Date(dateString);
    }

    if (date && !isNaN(date.getTime())) {
      if (date.toDateString() === now.toDateString()) {
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        _date = `${hour}:${minute}`;
      } else {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        _date = `${day}-${month}-${year}`;
      }
    }

    if (fromHeader && toHeader && subjectHeader) {
      messagesDetails.push({
        id: message.id,
        from: fromHeader.value,
        to: toHeader.value,
        subject: subjectHeader.value,
        content: content,
        date: _date,
      });
    }
  }
  res.send(messagesDetails);
});

const GetYoutubeVideo = async (id, userUid) => {
  const items = await youtube.videos
    .list({
      auth: oauth2Client,
      id: id,
      part: "snippet,contentDetails,statistics",
    })
    .then((response) => {
      console.log(response);
      return response.data.items;
    })
    .catch(async (error) => {
      if (error.response.status == 403) {
        console.log(
          "Authenticated user account suspended\nTry another account"
        );
        return { status: "error" };
      }
      if (error.response.status == 401 && tentative_refresh > 0) {
        console.log("aa");
        tentative_refresh--;
        const response = await getValidToken(refreshToken);
        if (response.status === "error") {
          console.log("bb");
          return { status: "error" };
        } else {
          console.log(response.content);
          accessToken = response.content;
          const userRef = admin.firestore().collection("Users").doc(userUid);
          const googleDocRef = userRef.collection("Services").doc("Google");
          if (response.content) {
            console.log("putaiiiin");
            await googleDocRef.update({
              accessToken: response.content,
            });
            oauth2Client.setCredentials({
              access_token: response.content,
              refresh_token: refreshToken,
            });
            console.log(
              "Tokens de Google mis à jour avec succès dans la base de données."
            );
          } else {
            console.error("Access token undefined.");
          }
        }
        return GetYoutubeVideo(id, userUid);
      }
      if (error.response.status == 401 && tentative_refresh == 0) {
        console.log("token expired please reconnect");
        return { status: "error" };
      }
      console.log("dd");
      tentative_refresh = 2;
      return { status: "error" };
    });
  if (items.status == "error") return { status: "error" };
  return items;
};

router.get("/GetYoutubeVideo", async (req, res) => {
  const tokens = await getUserTokens(req.query.uid);
  accessToken = tokens?.access;
  refreshToken = tokens?.refresh;
  console.log(accessToken);
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  const items = await GetYoutubeVideo(req.query.id, req.query.uid);
  if (req.query.info === "likes" && items[0]?.statistics != undefined) {
    const likes = parseInt(items[0].statistics.likeCount);
    res.send({ likes: likes });
  } else if (req.query.info === "views" && items[0]?.statistics != undefined) {
    const views = parseInt(items[0].statistics.viewCount);
    res.send({ views: views });
  } else res.send({ status: "error" });
});

module.exports = router;
