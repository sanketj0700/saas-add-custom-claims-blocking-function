// module imports
const gcipCloudFunctions = require('gcip-cloud-functions');
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp, applicationDefault, getApp, getApps } = require("firebase-admin/app");

// Initializing Auth Client
const authClient = new gcipCloudFunctions.Auth();

// initFirestore - Initializes and returns a firestore client instance
const initFirestore = () => {

  if (!getApps().length) {
    initializeApp();
  }

  const db = getFirestore();
  return db;
};

// getDomainsForTenantUser - Fetches all the documents with given email frm tenantUser and returns a 
const getDomainsForTenantUser = async (firestore, email) => {
  const resultObject = await firestore.collection("tenantUser")
    .where("email", "==", email)
    .select("domain")
    .get();

  const domainsArray = [];

  resultObject.forEach((doc) => domainsArray.push(doc.data().domain));

  return Array.from(new Set(domainsArray));
}

// beforeSignIn
exports.beforeSignIn = authClient.functions().beforeSignInHandler(async (user, context) => {
  try {

    const firestore = initFirestore();

    // validDomains - domains that are allowed for the user email
    console.log(user.email);

    const validDomains = await getDomainsForTenantUser(firestore, user.email);
    console.log(validDomains);

    // setting custom claim on user
    return {
      sessionClaims: {
        domains: validDomains,
      }
    };
  } catch (error) {
    console.log(error);
    throw new gcipCloudFunctions.https.HttpsError('internal');
  }
});