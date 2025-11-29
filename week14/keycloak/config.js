import Keycloak from "https://cdn.jsdelivr.net/npm/keycloak-js@26.2.0/+esm";

const keycloak = new Keycloak({
  url: "https://bscit.sit.kmutt.ac.th/intproj25/ft/keycloak/",
  realm: "itb-ecors",
  clientId: "itb-ecors-or4"
});

export default keycloak;