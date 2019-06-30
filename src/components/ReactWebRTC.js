import _ from 'lodash';

import React from 'react';

import {
  streamClose,
  manageAudio,
  manageVideo,
} from './methods';

import {
  addStream,
  removeStream,
  updateStream,
} from './dom';

import {
  startPeer,
  startScreen,
  stopScreen,
} from './actions';

/*
  Component Props
  isMicOn: local Stream mic on/off (boolean),
  isVideoOn: local Stream video on/off (boolean),
  isMyScreenShared: share Stream on/off (boolean),
  meeting_id: channel name,
  peerUID: uid of local Stream,
  peerStyle: object to style the video peers,
  screenShareUID: uid of share Stream, use 1 as default and make peers bigger than 1
  screenShareNode_id: dom node where screen will be inserted,
  videoNode_id: dom node where videos will be inserted,
  syncStreamList: informs external state about actual connected peers (it's a callback),
  onScreenShareDeny: callback,
*/

export class WebRTC extends React.Component {

  AgoraRTC = null;
  uid = null;
  client = null;
  localStream = null;
  shareUid = null;
  shareClient = null;
  shareStream = null;
  screenStartedCount = 0;
  transcode = 'interop';
  videoProfile = '360p_6';
  shareVideoProfile = '720p_2';

  state = {
    streamList: [],
  };

  updateState = ({ streamList }) => {
    const { syncStreamList } = this.props;
    this.setState({ streamList }, () => {
      const streamList_ids = _.map(streamList, item => item.getId());
      syncStreamList({ streamList_ids });
    });
  };

  constructor(props) {
    super(props);
    this.addStream = addStream.bind(this);
    this.removeStream = removeStream.bind(this);
    this.startPeer = startPeer.bind(this);
    this.stopScreen = stopScreen.bind(this);
    this.startScreen = startScreen.bind(this);
  }

  componentDidMount() {
    window.AgoraRTCComponent = this;
    this.startPeer();
    if (this.props.isMyScreenShared) this.startScreen();
  }

  componentWillReceiveProps(nextProps) {
    const { isMicOn, isVideoOn, isMyScreenShared } = nextProps;
    manageAudio(this, isMicOn ? 'enable' : 'disable');
    manageVideo(this, isVideoOn ? 'enable' : 'disable');
    if (isMyScreenShared) this.startScreen();
    if (this.props.isMyScreenShared && !isMyScreenShared) this.stopScreen();
  }

  componentWillUnmount() {
    streamClose(this, 'peer').catch(console.log);
    streamClose(this, 'screen').catch(console.log);
  }

  componentDidUpdate() {
    updateStream(this);
  }

  render() {
    return null;
  }

}

export default WebRTC;
