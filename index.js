// module imports
import gcipCloudFunctions from 'gcip-cloud-functions';
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, applicationDefault } from "firebase-admin/app";

// Initializing Auth Client
const authClient = new gcipCloudFunctions.Auth();

// initFirestore - Initializes and returns a firestore client instance
const initFirestore = () => {
  const db = getFirestore(initializeApp({
    credential: applicationDefault(),
  }));

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

// beforeCreate
exports.beforeCreate = authClient.functions().beforeCreateHandler((user, context) => {
  try {
    // Initialize Firestore client
    const firestore = initFirestore();

    // validDomains - domains that are allowed for the user email
    const validDomains = getDomainsForTenantUser(firestore, user.email);

    // setting custom claim on user
    return {
      custmClaims: {
        domains: validDomains,
      }
    };
  } catch (error) {
    throw new gcipCloudFunctions.https.HttpsError('internal');
  }
});