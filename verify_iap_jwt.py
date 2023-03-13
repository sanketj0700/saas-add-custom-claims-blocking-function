# module imports
from google.auth.transport import requests
from google.oauth2 import id_token

# iap_jwt - The IAP JWT token. Can be retreived from the header 'x-goog-iap-jwt-assertion'
# See https://cloud.google.com/iap/docs/signed-headers-howto#securing_iap_headers for more details.

# verify_iap_jwt - verifies whether the IAP JWT is valid or invalid.
# Returns an error, if any
def verify_iap_jwt(iap_jwt):
    try:
        # Check whether the JWT passed to the function is empty or not
        if not iap_jwt:
            raise Exception("Empty JWT")

        # expected_audience - The Signed Header JWT audience.
        # See https://cloud.google.com/iap/docs/signed-headers-howto for details on how to get this value.
        expected_audience = ""

        # certs_url - The URL containing a JSON dictionary that maps the kid claims to the public key values.
        # See https://cloud.google.com/iap/docs/signed-headers-howto#verifying_the_jwt_header for more understanding.
        certs_url = "https://www.gstatic.com/iap/verify/public_key"

        # decoded_iap_jwt - verifying and decoding the IAP JWT using google provided libraries and method.
        # See https://cloud.google.com/iap/docs/signed-headers-howto#retrieving_the_user_identity for more details.
        decoded_iap_jwt = id_token.verify_token(
            iap_jwt,
            requests.Request(),
            audience=expected_audience,
            certs_url=certs_url)

        # allowed_domains - A list of domains added as a sessionClaim in User's JWT using blocking functions.
        allowed_domains = list(decoded_iap_jwt['sessionClaims']['domains'])

        # tenant_domain - The domain of the Tenant Environment
        tenant_domain = os.environ['TENANT_DOMAIN']

        # Check whether the tenant_domain is amongst the allowed ones.
        if tenant_domain not in allowed_domains:
            raise Exception("Unauthorized")

        # The IAP JWT got verified successfully. Returning no errors.
        return None

    except Exception as e:
        # returning an error raised as exception.
        return "ERROR : IAP JWT validation error : {}".format(e)
