import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
  LOGIN_CONSENT_REDIRECT_VDXF_KEY,
  LOGIN_CONSENT_RESPONSE_VDXF_KEY,
} from 'verus-typescript-primitives';

import {setNavigationPath} from '../../../redux/reducers/navigation/navigationSlice';
import {SELECT_LOGIN_ID} from '../../../utils/constants';

import {RedirectRender} from './Redirect.render';

class Redirect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };

    this.redirect = this.redirect.bind(this);
    this.redirects = props.deeplinkData.challenge.redirect_uris;
    this.extraInfo = '';

    this.redirectinfo = null;
    if (this.redirects && this.redirects.length > 0) {
      const redirect = this.redirects[0];
      this.redirectinfo = {
        type: redirect.vdxfkey,
        uri: redirect.uri,
      };
    }

    if (
      this.redirectinfo != null &&
      this.redirectinfo.type === LOGIN_CONSENT_REDIRECT_VDXF_KEY.vdxfid
    ) {
      const url = new URL(this.redirectinfo.uri);
      this.extraInfo = ` and return to ${url.protocol}//${url.host}`;
    }
  }

  cancel() {
    this.props.dispatch(setNavigationPath(this.props.previousPath || SELECT_LOGIN_ID));
  }

  redirect() {
    this.setState({loading: true}, () => {
      this.props.completeLoginConsent({
        type: 'v1',
        responseKey: LOGIN_CONSENT_RESPONSE_VDXF_KEY.vdxfid,
        response: this.props.requestResult.response,
        redirect: this.redirectinfo,
      });
    });
  }

  render() {
    return RedirectRender.call(this);
  }
}

Redirect.propTypes = {
  deeplinkData: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  completeLoginConsent: PropTypes.func.isRequired,
  requestResult: PropTypes.object.isRequired,
  previousPath: PropTypes.string,
};

const mapStateToProps = state => {
  return {
    deeplinkData: state.deeplink.data,
    previousPath: state.navigation.previousPath,
  };
};

export default connect(mapStateToProps)(Redirect);
