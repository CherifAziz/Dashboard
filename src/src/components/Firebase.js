import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRg3VsQPDGCxxymNgQ7iMuaMCo76b0eQc",
  authDomain: "dashboard-e98c4.firebaseapp.com",
  databaseURL: "https://dashboard-e98c4-default-rtdb.firebaseio.com",
  projectId: "dashboard-e98c4",
  storageBucket: "dashboard-e98c4.appspot.com",
  messagingSenderId: "163621724364",
  appId: "1:163621724364:web:5e4fe0ef3e93106431a269",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "Users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await setDoc(doc(db, "Users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
      const userDocRef = doc(db, "Users", user?.uid);
      const servicesRef = collection(userDocRef, "Services");
      await setDoc(doc(servicesRef, "Weather"), {
        name: "Weather",
        state: true,
      });
      await setDoc(doc(servicesRef, "Cryptocurrency"), {
        name: "Cryptocurrency",
        state: true,
      });
      await setDoc(doc(servicesRef, "Google"), {
        name: "Google",
        state: false,
      });
      const widgetRef = collection(servicesRef, "Weather", "Widgets");
      await setDoc(doc(widgetRef, "Temperature"), {
        name: "Temperature",
        service: "Weather",
        state: true,
        city: "Toulouse",
      });
      const cryptoWidgetRef = collection(
        servicesRef,
        "Cryptocurrency",
        "Widgets"
      );
      await setDoc(doc(cryptoWidgetRef, "CryptoPrice"), {
        crypto: "0",
        name: "CryptoPrice",
        service: "Cryptocurrency",
        state: true,
      });
      const googleWidgetRef = collection(servicesRef, "Google", "Widgets");
      await setDoc(doc(googleWidgetRef, "Youtube"), {
        name: "Youtube",
        service: "Google",
        state: true,
        info: "views",
        videoId: "E-B5ndI9z1Q",
      });
      await setDoc(doc(googleWidgetRef, "Gmail"), {
        name: "Gmail",
        service: "Google",
        state: true,
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "Users", user.uid), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
    const userDocRef = doc(db, "Users", user?.uid);
    const servicesRef = collection(userDocRef, "Services");
    await setDoc(doc(servicesRef, "Weather"), {
      name: "Weather",
      state: true,
    });
    await setDoc(doc(servicesRef, "Cryptocurrency"), {
      name: "Cryptocurrency",
      state: true,
    });
    await setDoc(doc(servicesRef, "Google"), {
      name: "Google",
      state: false,
    });
    const widgetRef = collection(servicesRef, "Weather", "Widgets");
    await setDoc(doc(widgetRef, "Temperature"), {
      name: "Temperature",
      service: "Weather",
      state: true,
      city: "Toulouse",
    });
    const cryptoWidgetRef = collection(
      servicesRef,
      "Cryptocurrency",
      "Widgets"
    );
    await setDoc(doc(cryptoWidgetRef, "CryptoPrice"), {
      crypto: "0",
      name: "CryptoPrice",
      service: "Cryptocurrency",
      state: true,
    });
    const googleWidgetRef = collection(servicesRef, "Google", "Widgets");
    await setDoc(doc(googleWidgetRef, "Youtube"), {
      name: "Youtube",
      service: "Google",
      state: true,
      info: "views",
      videoId: "E-B5ndI9z1Q",
    });
    await setDoc(doc(googleWidgetRef, "Gmail"), {
      name: "Gmail",
      service: "Google",
      state: true,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  signOut(auth);
};

export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
};
