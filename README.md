# Verus Login Consent Client

The login consent client tool is a React/Webpack UI meant to be used together with Verus-Desktop to give the user the ability to login and consent to actions with VerusID.

## Development

To run a developement setup, run ```pnpm install``` followed by ```pnpm start```. If you'd like to run alongside Verus-Desktop, run the Verus-Desktop-GUI webpack bundler with ```pnpm start-no-dashboard``` instead of ```pnpm start```, so dashboards do not conflict.

## Building 

To compile to a build folder for production, run ```pnpm build```. To bundle with Verus-Desktop, put the contents of `build/` into `Verus-Desktop/assets/plugins/builtin/verus-login-consent-client/`.
